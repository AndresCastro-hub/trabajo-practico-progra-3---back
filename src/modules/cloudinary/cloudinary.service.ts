import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './cloudinary.interface';

@Injectable()
export class CloudinaryService implements IStorageService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'recipes' },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result.secure_url);
                }
            ).end(file.buffer);
        });
    }
}