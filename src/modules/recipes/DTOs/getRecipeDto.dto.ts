import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { RecipeDto } from "./recipe.dto";
import { Type } from "class-transformer";

export class GetRecipeDto{

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => RecipeDto)
    recipeDto!: RecipeDto[];
    
    @IsNumber()
    @IsNotEmpty()
    totalRecords!: number;

    @IsNumber()
    @IsNotEmpty()
    totalPages!: number;
}