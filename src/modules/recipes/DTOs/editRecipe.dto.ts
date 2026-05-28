import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";
import { Type } from "class-transformer";

export class editRecipeDto{
    @IsString()
    description?: string;

    @IsNumber()
    prepTime?: number;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    deletedIngredients?: IngredientDto[];

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    addedIngredients?: IngredientDto[];
}