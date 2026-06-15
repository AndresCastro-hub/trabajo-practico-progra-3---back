import { IsArray, IsNumber, ValidateNested } from "class-validator";
import { Ingredient } from "../entities/ingedients.entity";
import { Type } from "class-transformer";

export class IngredientResponseDto{
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => Ingredient)
    ingredients!: Ingredient[]

    @IsNumber()
    totalRecords!: number

    @IsNumber()
    totalPages!: number
}