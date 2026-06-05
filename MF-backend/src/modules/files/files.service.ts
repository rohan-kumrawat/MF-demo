import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { CloudinaryService } from './cloudinary.service';
import { CustomerFile } from './entities/file.entity';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  private static readonly MAX_UPLOAD_INPUT_SIZE_BYTES = 10 * 1024 * 1024;
  private static readonly TARGET_STORED_SIZE_BYTES = 200 * 1024;

  constructor(
    @InjectRepository(CustomerFile)
    private fileRepository: Repository<CustomerFile>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload one or more files for a customer
   */
  async uploadFiles(
    customerId: string,
    centreId: string,
    files: any[],
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles: FileResponseDto[] = [];

    for (const file of files) {
      if (file.size > FilesService.MAX_UPLOAD_INPUT_SIZE_BYTES) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum input limit of 10MB. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        );
      }

      try {
        const optimizedFile = await this.cloudinaryService.optimizeForUpload(
          file.buffer,
          file.mimetype,
          FilesService.TARGET_STORED_SIZE_BYTES,
        );

        if (file.mimetype.startsWith('image/') && optimizedFile.size > FilesService.TARGET_STORED_SIZE_BYTES) {
          throw new BadRequestException(
            `Image ${file.originalname} could not be compressed to 200KB. Try a smaller source image or convert it to JPG/PNG.`,
          );
        }

        if (!file.mimetype.startsWith('image/') && file.size > FilesService.TARGET_STORED_SIZE_BYTES) {
          throw new BadRequestException(
            `Only image files can be auto-compressed to 200KB. File ${file.originalname} must already be <= 200KB before upload.`,
          );
        }

        const uploadResult = await this.cloudinaryService.uploadFile(
          optimizedFile.buffer,
          file.originalname,
          `microfinance/centres/${centreId}/customers/${customerId}`,
        );

        const customerFile = this.fileRepository.create({
          customerId,
          loanId: uploadFileDto.loanId || null,
          centreId,
          cloudinaryPublicId: uploadResult.public_id,
          fileUrl: uploadResult.secure_url,
          originalFileName: file.originalname,
          mimeType: optimizedFile.mimeType,
          fileSize: uploadResult.size,
          documentType: uploadFileDto.documentType || null,
          description: uploadFileDto.description || null,
        });

        await this.fileRepository.save(customerFile);
        uploadedFiles.push(this.mapToResponseDto(customerFile));
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload file ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return uploadedFiles;
  }

  async uploadFile(
    customerId: string,
    centreId: string,
    file: any,
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    const [uploadedFile] = await this.uploadFiles(customerId, centreId, [file], uploadFileDto);
    return uploadedFile;
  }

  /**
   * Get a single file by ID — M-3: centreId enforced
   */
  async getFile(fileId: string, centreId: string, customerId?: string): Promise<FileResponseDto> {
    const query = this.fileRepository
      .createQueryBuilder('f')
      .where('f.id = :fileId AND f.centreId = :centreId', { fileId, centreId });

    if (customerId) {
      query.andWhere('f.customerId = :customerId', { customerId });
    }

    const file = await query.getOne();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.mapToResponseDto(file);
  }

  /**
   * Get all files for a customer
   */
  async getCustomerFiles(customerId: string, centreId?: string): Promise<FileResponseDto[]> {
    return this.getCustomerFilesByLoan(customerId, centreId);
  }

  /**
   * Get all files for a customer, optionally filtered by loan
   */
  async getCustomerFilesByLoan(
    customerId?: string,
    centreId?: string,
    loanId?: string,
  ): Promise<FileResponseDto[]> {
    const query = this.fileRepository
      .createQueryBuilder('f')
      .orderBy('f.uploadedAt', 'DESC');

    if (customerId) {
      query.andWhere('f.customerId = :customerId', { customerId });
    }

    if (centreId) {
      query.andWhere('f.centreId = :centreId', { centreId });
    }

    if (loanId) {
      query.andWhere('f.loanId = :loanId', { loanId });
    }

    const files = await query.getMany();
    return files.map((f) => this.mapToResponseDto(f));
  }

  /**
   * Delete a file — M-3: centreId enforced
   */
  async deleteFile(fileId: string, centreId: string, customerId?: string): Promise<{ message: string }> {
    const query = this.fileRepository
      .createQueryBuilder('f')
      .where('f.id = :fileId AND f.centreId = :centreId', { fileId, centreId });

    if (customerId) {
      query.andWhere('f.customerId = :customerId', { customerId });
    }

    const file = await query.getOne();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      await this.cloudinaryService.deleteFile(file.cloudinaryPublicId);
      await this.fileRepository.remove(file);
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get files by document type for a customer — M-3: centreId enforced
   */
  async getFilesByDocumentType(
    customerId: string,
    documentType: string,
    centreId: string,
  ): Promise<FileResponseDto[]> {
    const files = await this.fileRepository.find({
      where: { customerId, documentType, centreId },
      order: { uploadedAt: 'DESC' },
    });

    return files.map((f) => this.mapToResponseDto(f));
  }

  /**
   * Delete all files for a customer — M-10: centreId scoped, ADMIN only
   * Mn-11: Partial failures are tracked and reported rather than swallowed.
   */
  async deleteCustomerAllFiles(
    customerId: string,
    centreId: string,
  ): Promise<{ message: string; deletedCount: number; failedCount: number }> {
    const files = await this.fileRepository.find({ where: { customerId, centreId } });

    let deletedCount = 0;
    let failedCount  = 0;

    for (const file of files) {
      try {
        await this.cloudinaryService.deleteFile(file.cloudinaryPublicId);
        await this.fileRepository.remove(file);
        deletedCount++;
      } catch (error) {
        // Mn-11: Log properly and count — don't silently ignore
        failedCount++;
        console.error(
          `[FilesService] Failed to delete file ${file.id} (${file.originalFileName}):`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    const message = failedCount === 0
      ? `Deleted ${deletedCount} file(s) for customer`
      : `Deleted ${deletedCount} file(s); ${failedCount} file(s) failed — check server logs`;

    return { message, deletedCount, failedCount };
  }

  private mapToResponseDto(file: CustomerFile): FileResponseDto {
    return {
      id: file.id,
      customerId: file.customerId,
      loanId: file.loanId,
      centreId: file.centreId,
      originalFileName: file.originalFileName,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      documentType: file.documentType,
      description: file.description,
      uploadedAt: file.uploadedAt,
    };
  }
}
