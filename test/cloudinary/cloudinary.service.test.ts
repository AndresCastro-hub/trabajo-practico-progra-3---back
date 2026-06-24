import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from '../../src/modules/cloudinary/cloudinary.service';

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload_stream: jest.fn(),
        },
    },
}));

const mockConfigService = {
    get: jest.fn((key: string) => {
        const config: Record<string, string> = {
            CLOUDINARY_CLOUD_NAME: 'test-cloud',
            CLOUDINARY_API_KEY: 'test-key',
            CLOUDINARY_API_SECRET: 'test-secret',
        };
        return config[key];
    }),
};

describe('CloudinaryService', () => {
    let service: CloudinaryService;

    beforeEach(() => {
        service = new CloudinaryService(
            mockConfigService as unknown as ConfigService,
        );
    });

    afterEach(() => jest.clearAllMocks());

    it('configura cloudinary con las variables de entorno correctas', () => {
        expect(cloudinary.config).toHaveBeenCalledWith({
            cloud_name: 'test-cloud',
            api_key: 'test-key',
            api_secret: 'test-secret',
        });
    });

    it('sube una imagen y retorna la URL segura', async () => {
        const mockFile = {
            buffer: Buffer.from('imagen'),
            originalname: 'test.jpg',
        } as Express.Multer.File;

        const mockStream = { end: jest.fn() };

        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
            (_options, callback) => {
                callback(null, {
                    secure_url: 'https://cloudinary.com/imagen.jpg',
                });
                return mockStream;
            },
        );

        const result = await service.uploadImage(mockFile);

        expect(result).toBe('https://cloudinary.com/imagen.jpg');
        expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('lanza error si cloudinary falla', async () => {
        const mockFile = {
            buffer: Buffer.from('imagen'),
        } as Express.Multer.File;

        const mockStream = { end: jest.fn() };

        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
            (_options, callback) => {
                callback(new Error('Error de cloudinary'), null);
                return mockStream;
            },
        );

        await expect(service.uploadImage(mockFile)).rejects.toThrow(
            'Error de cloudinary',
        );
    });

    it('rechaza con null si result es null', async () => {
        const mockFile = {
            buffer: Buffer.from('imagen'),
        } as Express.Multer.File;

        const mockStream = { end: jest.fn() };

        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
            (_options, callback) => {
                callback(null, null);
                return mockStream;
            },
        );

        await expect(service.uploadImage(mockFile)).rejects.toBeNull();
    });
});