import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './DTOs/createRecipe.dto';
import { RecipeResponseDto } from './DTOs/recipeResponse.dto';
import { RecipeRepository } from './repositories/recipe.repository';
import { RecipeIngredientRepository } from './repositories/recipe-ingredient.repository';
import { NUTRITION_SERVICE } from '../nutrition/nutrition.interface';
import { GetRecipeDto } from './DTOs/getRecipeDto.dto';
import { plainToInstance } from 'class-transformer';
import { RecipeDto } from './DTOs/recipe.dto';
import { GetRecipeIdDto } from './DTOs/getRecipeId.dto';
import type { NutritionService } from '../nutrition/nutrition.interface';
import { Ingredient } from '../ingredients/entities/ingedients.entity';
import {  STORAGE_SERVICE } from '../cloudinary/cloudinary.interface';
import type { IStorageService } from '../cloudinary/cloudinary.interface';
import { editRecipeDto } from './DTOs/editRecipe.dto';

@Injectable()
export class RecipesService {

    constructor(
        private recipeRepository: RecipeRepository,
        private recipeIngredientRepository: RecipeIngredientRepository,

        @Inject(NUTRITION_SERVICE)
        private nutritionService: NutritionService,

        @Inject(STORAGE_SERVICE)
        private storageService: IStorageService,
    ) {}

    async create(dto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
        const ingredientes = await this.recipeIngredientRepository.validateIngredients(dto.ingredientes);
        const totalCalorias = await this.calcularCalorias(ingredientes);
        const receta = await this.recipeRepository.save(dto, userId, totalCalorias);
        await this.recipeIngredientRepository.saveAll(receta, ingredientes);
        return this.recipeRepository.findWithRelations(receta.id);
    }

    async uploadImage(id: number, imagen: Express.Multer.File): Promise<RecipeResponseDto> {
        if (!imagen) throw new BadRequestException('La imagen es obligatoria');
        const imageUrl = await this.storageService.uploadImage(imagen);
        await this.recipeRepository.updateImageUrl(id, imageUrl);
        return this.recipeRepository.findWithRelations(id);
    }

    private async calcularCalorias(ingredientes: { ingrediente: Ingredient; cantidad: number }[]): Promise<number> {
        const calorias = await Promise.all(
            ingredientes.map(({ ingrediente, cantidad }) =>
                this.nutritionService.getCaloriasPorIngrediente(ingrediente.nombre, cantidad, ingrediente.unidad)
            )
        );
        return Math.round(calorias.reduce((sum, cal) => sum + cal, 0));
    }
    
    async getterRecipes(page: number, userId: number, recetasPlataforma: boolean, name?: string): Promise<GetRecipeDto>{
        const recipesPerPage = 6

        const recipeResponse = (await this.recipeRepository.getRecipes(page, userId, recetasPlataforma, name))

        const getRecipeDto: GetRecipeDto = {
            recipeDto: plainToInstance(RecipeDto, recipeResponse.recipe),
            totalRecords: recipeResponse.totalCount,
            totalPages: Math.ceil(recipeResponse.totalCount/recipesPerPage)
        }
        return getRecipeDto
    }

    async getRecipeById(recipeId: number): Promise<GetRecipeIdDto>{
        return this.recipeRepository.getRecipeById(recipeId)
    }

    async editRecipe(editData: editRecipeDto, recipeId: number, userId: number): Promise<RecipeResponseDto>{
        await this.recipeRepository.validateUser(recipeId, userId);
        await this.recipeRepository.edit(editData, recipeId);
        await this.recipeIngredientRepository.deleteRecipeIngredients(editData, recipeId);
        await this.recipeIngredientRepository.addRecipeIngredients(editData, recipeId);
        await this.recipeIngredientRepository.updateIngredients(editData, recipeId);
        return this.recipeRepository.findWithRelations(recipeId)
    }

    async deleteRecipe(recipeId: number, userId: number): Promise<RecipeResponseDto>{
        await this.recipeRepository.validateUser(recipeId, userId);
        await this.recipeIngredientRepository.deleteIngredients(recipeId);
        const deletedRecipe = await this.recipeRepository.deleteRecipe(recipeId);

        return deletedRecipe
    }
}
