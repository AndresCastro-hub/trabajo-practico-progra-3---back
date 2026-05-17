import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './DTOs/createRecipe.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuardDto } from '../auth/dtos/role.dto';
import { RecipeResponseDto } from './DTOs/recipeResponse.dto';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva receta' })
  @ApiResponse({ status: 201, description: 'Receta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Ingrediente no encontrado' })
  public async create(@Body() dto: CreateRecipeDto, @Request() req: { user: RoleGuardDto }): Promise<RecipeResponseDto> {
    return this.recipesService.create(dto, req.user.id);
  }
}