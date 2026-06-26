import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Ingredient } from "./entities/ingedients.entity";
import { IngredientsRepository } from "./ingredients.repository";
import { createIngredientDto } from "./DTOs/ingredient.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IngredientResponseDto } from "./DTOs/ingredientResponse.dto";

@Controller('ingredients')

export class IngredientController {
    constructor(private readonly ingredientsRepository: IngredientsRepository) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    public async getIngredientes(
        @Query('page') page: number,
        @Query('name') name: string
    ): Promise<IngredientResponseDto> {
        return await this.ingredientsRepository.listarIngredientes(page, name)
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('administrador')
    @ApiOperation({summary: 'Crear un ingrediente'})
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