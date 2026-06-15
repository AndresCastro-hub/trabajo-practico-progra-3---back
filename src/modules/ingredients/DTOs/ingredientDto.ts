import { IsNotEmpty, IsString } from "class-validator";

export class createIngredientDto{

    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsNotEmpty()
    unidad!: string;
}