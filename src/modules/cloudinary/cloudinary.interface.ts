export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
    uploadImage(file: Express.Multer.File): Promise<string>;
}