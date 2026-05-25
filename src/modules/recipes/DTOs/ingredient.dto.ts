import { ApiProperty } from "@nestjs/swagger"
import { IsNumber } from "class-validator"

export class IngredientDto {
    @ApiProperty({ example: 1, description: 'ID del ingrediente' })
    @IsNumber({}, { message: 'El ID del ingrediente debe ser un número' })
    ingredient_id!: number

    @ApiProperty({ example: 200, description: 'Cantidad del ingrediente' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad!: number
}