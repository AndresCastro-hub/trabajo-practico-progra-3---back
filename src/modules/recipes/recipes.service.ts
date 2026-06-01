import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { Recipe } from './entities/recipe.entity';

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

        const totalcount = await this.recipeRepository.useRepository()
        .createQueryBuilder('recipe')
        .getCount()

        let recipe: Recipe[] = [];
        if(recetasPlataforma){
            recipe = await this.getPlataformRecipes(page, recipesPerPage, name);
        } else{
            recipe = await this.getUserRecipes(page, recipesPerPage, userId, name);
        }

        if (!recipe || recipe.length === 0) {
            throw new NotFoundException(`No hay registros de recetas disponibles`);
        }

        const getRecipeDto = {
            recipeDto: plainToInstance(RecipeDto, recipe),
            totalRecords: totalcount,
            totalPages: Math.ceil(totalcount/recipesPerPage)
        }
        return getRecipeDto
    }

    private async getUserRecipes(page: number, recipesPerPage: number, userId: number, name?: string): Promise<Recipe[]>{
        const query = this.recipeRepository.useRepository()
            .createQueryBuilder('recipe')
            .where('recipe.idUsuario = :id', {id: userId});
        
        if(name){
            query.andWhere('recipe.nombre ILIKE :nombre', {nombre: `%${name}%`});
        }

        return await query
            .skip(recipesPerPage * page)
            .take(recipesPerPage)
            .getMany()
    }

    private async getPlataformRecipes(page: number, recipesPerPage: number, name?: string): Promise<Recipe[]>{
        const adminId = 1

        const query = this.recipeRepository.useRepository()
        .createQueryBuilder('recipe')
        .where('recipe.idUsuario = :id', { id: adminId });

        if(name){
            query.andWhere('recipe.nombre ILIKE :nombre', {nombre: `%${name}%`});
            if(!query){
                throw new NotFoundException(`No existen recetas que contengan el nombre: ${name}`);
            }
        }

        return await query
            .skip(recipesPerPage * page)
            .take(recipesPerPage)
            .getMany()
    }

    async getRecipeById(recipeId: number): Promise<GetRecipeIdDto>{
        return this.recipeRepository.getRecipeById(recipeId)
    }

    async editRecipe(){
        
    }
}
