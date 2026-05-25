import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";
import { Type } from "class-transformer";

export class GetRecipeIdDto{
    
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
    
    @IsNumber()
    @IsNotEmpty() 
    idUsuario!: number;
    
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => IngredientDto)
    ingredientes!: IngredientDto[]
}