import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRecipeDto {
    @ApiProperty({ example: 'Milanesa Napolitana' })
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre de la receta es obligatorio' })
    nombre!: string

    @ApiPropertyOptional({ example: 'Clásica milanesa con salsa, jamon y queso' })
    @IsString({ message: 'La descripción de la receta debe ser un texto' })
    @IsOptional()
    descripcion?: string

    @ApiProperty({ example: 30, description: 'Tiempo en minutos' })
    @IsNumber({}, { message: 'El tiempo de preparación debe ser un número' })
    @IsNotEmpty({ message: 'El tiempo de preparación es obligatorio' })
    tiempoPreparacion!: number

    @ApiProperty({ type: [IngredientDto] })
    @IsArray({ message: 'Los ingredientes deben ser un array' })
    @ValidateNested({ each: true })
    @Type(() => IngredientDto)
    ingredientes!: IngredientDto[];
}