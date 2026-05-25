import { Body, Controller, Post, UseGuards, Request, UploadedFile, UseInterceptors, Patch, Param, ParseIntPipe, Get, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './DTOs/createRecipe.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuardDto } from '../auth/dtos/role.dto';
import { RecipeResponseDto } from './DTOs/recipeResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GetRecipeDto } from './DTOs/getRecipeDto.dto';
import { GetRecipeIdDto } from './DTOs/getRecipeId.dto';

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
  public async create(
    @Body() dto: CreateRecipeDto,
    @Request() req: { user: RoleGuardDto },
  ): Promise<RecipeResponseDto> {
    return this.recipesService.create(dto, req.user.id);
  }

  @Patch(':id/imagen')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imagen: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir imagen de una receta' })
  @ApiResponse({ status: 200, description: 'Imagen subida exitosamente' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada' })
  public async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() imagen: Express.Multer.File
  ): Promise<RecipeResponseDto> {
    return this.recipesService.uploadImage(id, imagen);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener recetas del usuario o de la plataforma paginadas' })
  @ApiResponse({ status: 200, description: 'Listado de recetas obtenido con éxito.', type: GetRecipeDto })
  @ApiResponse({ status: 404, description: 'No hay registros de recetas disponibles' })
  public async getRecipes(
    @Query('page')page: number, 
    @Query('recetasPlataforma')recetasPlataforma: boolean,
    @Query('nombre')name: string,
    @Request() req: { user: RoleGuardDto }
  ): Promise<GetRecipeDto>{
    return this.recipesService.getterRecipes(page, req.user.id, recetasPlataforma, name)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una receta específica por su ID' })
  @ApiResponse({ status: 200, description: 'Receta encontrada con éxito.', type: GetRecipeIdDto })
  @ApiResponse({ status: 404, description: 'La receta con el ID proporcionado no existe.' })
  public async getOneRecipeById(
    @Param('id', ParseIntPipe)recipeId: number
  ): Promise<GetRecipeIdDto>{
    return this.recipesService.getRecipeById(recipeId)
  }
}