import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class editRecipeDto{
    @ApiPropertyOptional({ example: 'Clásica milanesa con salsa, jamon y queso' })
    @IsOptional({message: 'la descripcion es opcional'})
    @IsString({ message: 'La descripcion debe ser un texto' })
    description?: string;

    @ApiPropertyOptional({ example: 30, description: 'Tiempo en minutos' })
    @IsOptional({message: 'El tiempo de preparacion es opcional'})
    @IsNumber()
    prepTime?: number;

    @IsOptional({message: 'Los ingredientes a eliminar son opcionales'})
    @IsArray()
    @IsNumber({}, { each: true })
    deletedIngredientsId?: number[];

    @IsOptional({message: 'Los ingredientes a agregar son opcionales'})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    addedIngredients?: IngredientDto[];

    @IsOptional({message: 'Los ingredientes a actualizar son opcionales'})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    updatedIngredients?: IngredientDto[];
}