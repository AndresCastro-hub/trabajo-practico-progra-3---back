import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RecipeDto{

    @IsNumber()
    @IsNotEmpty()
    id!: number;

    @IsString()
    @IsNotEmpty()
    nombre!: string

    @IsString()
    @IsNotEmpty()
    descripcion?: string

    @IsNumber()
    @IsNotEmpty()
    calorias!: number

    @IsNumber()
    @IsNotEmpty()
    tiempoPreparacion!: number

    @IsString()
    @IsNotEmpty()  
    imagen_url!: string;
}