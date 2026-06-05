import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';

export interface OptimizedFile {
  buffer: Buffer;
  mimeType: string;
  size: number;
  optimized: boolean;
}

const TARGET_UPLOAD_SIZE_BYTES = 200 * 1024;

@Injectable()
export class CloudinaryService {
  constructor() {
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Mn-10: Fail fast with a clear message rather than a mysterious upload error later
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary configuration. Ensure CLOUDINARY_CLOUD_NAME, ' +
        'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env',
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }

  /**
   * Upload a file buffer to Cloudinary
   * @param fileBuffer - Buffer of the file to upload
   * @param fileName - Original file name
   * @param folder - Folder path in Cloudinary (e.g., 'microfinance/customers')
   * @returns Upload result with public_id and secure_url
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = 'microfinance/receipts',
  ): Promise<{ public_id: string; secure_url: string; size: number }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          public_id: `${Date.now()}-${fileName.split('.')[0]}`,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result!.public_id,
              secure_url: result!.secure_url,
              size: result!.bytes,
            });
          }
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async optimizeForUpload(
    fileBuffer: Buffer,
    mimeType: string,
    targetSizeBytes: number = TARGET_UPLOAD_SIZE_BYTES,
  ): Promise<OptimizedFile> {
    if (!mimeType.startsWith('image/')) {
      return {
        buffer: fileBuffer,
        mimeType,
        size: fileBuffer.length,
        optimized: false,
      };
    }

    if (fileBuffer.length <= targetSizeBytes) {
      return {
        buffer: fileBuffer,
        mimeType,
        size: fileBuffer.length,
        optimized: false,
      };
    }

    const qualities = [90, 80, 70, 60, 50, 40, 30, 25, 20];
    let bestBuffer = fileBuffer;

    // Mn-12: One pass through quality levels is sufficient — the outer loop
    // was iterating 4 times over the same unchanged fileBuffer (wasted CPU).
    const metadata = await sharp(fileBuffer).metadata();
    const width = metadata.width && metadata.width > 1800 ? 1800 : metadata.width;

    for (const quality of qualities) {
      const outputBuffer = await sharp(fileBuffer)
        .rotate()
        .resize(width ? { width, withoutEnlargement: true } : undefined)
        .webp({ quality })
        .toBuffer();

      if (outputBuffer.length < bestBuffer.length) {
        bestBuffer = outputBuffer;
      }

      if (outputBuffer.length <= targetSizeBytes) {
        return {
          buffer   : outputBuffer,
          mimeType : 'image/webp',
          size     : outputBuffer.length,
          optimized: true,
        };
      }
    }

    // Last resort: shrink width to 75% at low quality
    if (width && width > 600) {
      const resizedBuffer = await sharp(fileBuffer)
        .rotate()
        .resize({ width: Math.floor(width * 0.75), withoutEnlargement: true })
        .webp({ quality: 35 })
        .toBuffer();

      if (resizedBuffer.length < bestBuffer.length) bestBuffer = resizedBuffer;

      if (resizedBuffer.length <= targetSizeBytes) {
        return {
          buffer   : resizedBuffer,
          mimeType : 'image/webp',
          size     : resizedBuffer.length,
          optimized: true,
        };
      }
    }

    return {
      buffer: bestBuffer,
      mimeType: 'image/webp',
      size: bestBuffer.length,
      optimized: bestBuffer.length < fileBuffer.length,
    };
  }

  /**
   * Delete a file from Cloudinary by public_id
   * @param publicId - Cloudinary public ID
   */
  async deleteFile(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      });
    });
  }

  /**
   * Get file URL from Cloudinary (can be used for serving/downloading)
   * @param publicId - Cloudinary public ID
   */
  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
    });
  }
}
