import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, ValidateNested } from "class-validator"
import { Ingredient } from "../../ingredients/entities/ingedients.entity"
import { Type } from "class-transformer"

export class IngredientDto {
    @ApiProperty({ example: 1, description: 'ID del ingrediente' })
    @IsNumber({}, { message: 'El ID del ingrediente debe ser un número' })
    ingrediente_id!: number

    @ApiProperty({ example: 200, description: 'Cantidad del ingrediente' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad!: number
}

export class GetIngredientDto{
    @ApiProperty({ type: () => Ingredient , description: 'Objeto completo del ingrediente' })
    @ValidateNested()
    @Type(() => Ingredient)
    ingrediente_id!: Ingredient

    @ApiProperty({ example: 200, description: 'Cantidad del ingrediente' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad!: number
}