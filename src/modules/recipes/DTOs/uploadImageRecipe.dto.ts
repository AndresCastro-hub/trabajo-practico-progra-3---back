
import { ApiProperty } from "@nestjs/swagger";

export class UploadImageRecipe {
    @ApiProperty({ type: 'string', format: 'binary', description: 'Imagen de la receta' })
    imagen!: Express.Multer.File
}