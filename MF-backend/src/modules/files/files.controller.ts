import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('files')
@UseGuards(JwtAuthGuard, CentreIsolationGuard)   // M-3: centreId isolation on every route
export class FilesController {
  constructor(private filesService: FilesService) {}

  /**
   * Upload one or more files for the authenticated customer
   * Each image is compressed independently to ~200KB target
   * POST /files/upload
   * Form Data: files (binary array), documentType (optional), description (optional)
   */
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'files', maxCount: 20 },
      { name: 'files[]', maxCount: 20 },
    ], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB input, compressed down before upload
        files: 20,
      },
    }),
  )
  async uploadFile(
    @UploadedFiles() filesPayload: { files?: any[]; 'files[]'?: any[] },
    @Req() req: any,
    @CurrentUser() user: any,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<{ success: boolean; data: FileResponseDto[] }> {
    const files = [
      ...(filesPayload?.files ?? []),
      ...(filesPayload?.['files[]'] ?? []),
    ];

    if (!files || files.length === 0) {
      // Debugging info for multipart upload issues
      console.warn('Upload endpoint received no files. req.headers[content-type]=', req.headers?.['content-type']);
      console.warn('req.files present?', !!req.files, 'req.body keys=', Object.keys(req.body || {}), 'uploaded keys=', Object.keys(filesPayload || {}));
      throw new BadRequestException('No files provided');
    }
    if (!uploadFileDto.customerId) {
      throw new BadRequestException('customerId is required');
    }

    const uploadedFiles = await this.filesService.uploadFiles(
      uploadFileDto.customerId,
      user.centreId,
      files,
      uploadFileDto,
    );

    return {
      success: true,
      data: uploadedFiles,
    };
  }

  /**
   * Get a specific file by ID
   * GET /files/:fileId
   * M-3: centreId scoped — users can only fetch files belonging to their own centre.
   */
  @Get(':fileId')
  async getFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: FileResponseDto }> {
    // Pass centreId so the service enforces isolation
    const file = await this.filesService.getFile(fileId, user.centreId, user.sub);

    return {
      success: true,
      data: file,
    };
  }

  /**
   * Get all files for the authenticated customer
   * GET /files/customer/my-files
   */
  @Get('customer/my-files')
  async getMyFiles(
    @CurrentUser() user: any,
    @Query('loanId') loanId?: string,
  ): Promise<{ success: boolean; data: FileResponseDto[] }> {
    // Mn-12: Use user.sub (not user.id) which is populated by JwtStrategy.
    // If loanId is provided and the user is an ADMIN or AGENT, we allow fetching
    // files for that loan regardless of customerId (scoped to centreId).
    const isElevatedRole = user.role === Role.ADMIN || user.role === Role.AGENT;
    const targetCustomerId = (isElevatedRole && loanId) ? undefined : user.sub;

    const files = await this.filesService.getCustomerFilesByLoan(
      targetCustomerId,
      user.centreId,
      loanId,
    );

    return {
      success: true,
      data: files,
    };
  }

  /**
   * Delete a specific file
   * DELETE /files/:fileId
   * M-3: centreId scoped — users can only delete their own centre's files.
   */
  @Delete(':fileId')
  async deleteFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.filesService.deleteFile(fileId, user.centreId, user.sub);

    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * Delete all files for a specific customer (ADMIN only)
   * DELETE /files/customer/:customerId/all
   * M-10: Requires ADMIN role. customerId must be explicit in the URL —
   *        prevents accidental self-wipe and requires deliberate targeting.
   */
  @Delete('customer/:customerId/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteAllFiles(
    @Param('customerId') customerId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; message: string; deletedCount: number; failedCount: number }> {
    const result = await this.filesService.deleteCustomerAllFiles(customerId, user.centreId);

    return {
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
      failedCount : result.failedCount,
    };
  }
}
