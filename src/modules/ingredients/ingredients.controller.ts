import { Controller, Query } from "@nestjs/common";
import { Ingredient } from "./entities/ingedients.entity";
import { IngredientsRepository } from "./ingredients.repository";

@Controller('ingredients')

export class IngredientController{
    constructor(private readonly ingredientsRepository: IngredientsRepository){}

    public async getIngredientes(@Query('limit') limit: number, @Query('offset') offset: number): Promise <Ingredient[]>{
        return await this.ingredientsRepository.listarIngredientes(limit, offset)
    }
}