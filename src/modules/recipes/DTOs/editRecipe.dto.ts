import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";
import { Type } from "class-transformer";

export class editRecipeDto{
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    prepTime?: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    deletedIngredientsId?: number[];

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    addedIngredients?: IngredientDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    updatedIngredients?: IngredientDto[];
}