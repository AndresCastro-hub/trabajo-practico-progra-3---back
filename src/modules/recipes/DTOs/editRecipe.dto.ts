import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";
import { Type } from "class-transformer";

export class editRecipeDto{
    @IsString()
    description?: string;

    @IsNumber()
    prepTime?: number;

    @IsArray()
    @IsNumber({}, { each: true })
    deletedIngredientsId?: number[];

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    addedIngredients?: IngredientDto[];
}