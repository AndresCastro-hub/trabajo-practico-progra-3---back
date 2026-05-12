import { Controller, Get, Query } from "@nestjs/common";
import { Ingredient } from "./entities/ingedients.entity";
import { IngredientsRepository } from "./ingredients.repository";

@Controller('ingredients')

export class IngredientController{
    constructor(private readonly ingredientsRepository: IngredientsRepository){}

    @Get('list')
    public async getIngredientes(@Query('limit') limit: number = 10, @Query('offset') offset: number = 0): Promise <Ingredient[]>{
        return await this.ingredientsRepository.listarIngredientes(limit, offset)
    }
}