import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Ingredient } from "./entities/ingedients.entity";
import { IngredientsRepository } from "./ingredients.repository";
import { createIngredientDto } from "./DTOs/ingredientDto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('ingredients')

export class IngredientController {
    constructor(private readonly ingredientsRepository: IngredientsRepository) { }

    @Get()
    public async getIngredientes(@Query('limit') limit: number = 10, @Query('offset') offset: number = 0): Promise<Ingredient[]> {
        return await this.ingredientsRepository.listarIngredientes(limit, offset)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(1)
    public async postIngredientes(@Body() createDto: createIngredientDto): Promise<Ingredient> {
        return await this.ingredientsRepository.crearIngredientes(createDto)
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todos los ingredientes' })
    public async getAll(): Promise<Ingredient[]> {
        return await this.ingredientsRepository.listarTodos();
    }

}