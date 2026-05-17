import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Ingredient } from "./entities/ingredients.entity";
import { IngredientsService } from "./ingredients.service";
import { createIngredientDto } from "./DTOs/ingredientDto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller('ingredients')

export class IngredientController{
    constructor(private readonly ingredientsService: IngredientsService){}

    @Get()
    public async getIngredientes(@Query('limit') limit: number = 10, @Query('offset') offset: number = 0): Promise <Ingredient[]>{
        return await this.ingredientsService.listarIngredientes(limit, offset)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(1)
    public async postIngredientes(@Body() createDto: createIngredientDto): Promise <Ingredient>{
        return await this.ingredientsService.crearIngredientes(createDto)
    }
}