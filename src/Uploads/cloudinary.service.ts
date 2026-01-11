



import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
      api_key: process.env.CLOUDINARY_API_KEY  , 
      api_secret: process.env.CLOUDINARY_API_SECRET  
    });
  }

  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'nestjs_uploads' }, 
        (error, result) => {
          if (error) return reject(error);
          if (result)
            resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}