import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { STORAGE_SERVICE } from './cloudinary.interface';

@Module({
    providers: [
        {
            provide: STORAGE_SERVICE,
            useClass: CloudinaryService,
        }
    ],
    exports: [STORAGE_SERVICE],
})
export class CloudinaryModule {}