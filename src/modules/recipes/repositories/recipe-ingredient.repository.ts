import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { Ingredient } from '../../ingredients/entities/ingedients.entity';
import { Recipe } from '../entities/recipe.entity';
import { IngredientDto } from '../DTOs/ingredient.dto';
import { editRecipeDto } from '../DTOs/editRecipe.dto';

@Injectable()
export class RecipeIngredientRepository {
    constructor(
        @InjectRepository(RecipeIngredient)
        private repository: Repository<RecipeIngredient>,

        @InjectRepository(Ingredient)
        private ingredientRepository: Repository<Ingredient>,

        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>
    ) {}

    async validateIngredients(ingredients: IngredientDto[]): Promise<{ ingrediente: Ingredient; cantidad: number }[]> {
        return Promise.all(
            ingredients.map(async (i) => {
                const ingrediente = await this.ingredientRepository.findOne({ where: { id: i.ingrediente_id } });
                if (!ingrediente) throw new NotFoundException(`Ingrediente ${i.ingrediente_id} no encontrado`);
                return { ingrediente, cantidad: i.cantidad };
            })
        );
    }

    async saveAll(receta: Recipe, ingredientes: { ingrediente: Ingredient; cantidad: number }[]): Promise<void> {
        const recipeIngredients = ingredientes.map(({ ingrediente, cantidad }) =>
            this.repository.create({ receta, ingrediente, cantidad })
        );
        await this.repository.save(recipeIngredients);
    }

    async deleteRecipeIngredients(editData: editRecipeDto, recipeId: number): Promise<void>{

        if(editData.deletedIngredientsId){
            await this.repository
            .createQueryBuilder()
            .delete()
            .where("receta_id = :recipeId", {recipeId: recipeId})
            .andWhere("ingrediente_id IN (:...ingredientId)", {ingredientId: editData.deletedIngredientsId})
            .execute()
        }
    }

    async addRecipeIngredients(editData: editRecipeDto, recipeId: number): Promise<void>{

        if(editData.addedIngredients){
            const ingredientes = await this.validateIngredients(editData.addedIngredients)

            const recipe = await this.recipeRepository
            .createQueryBuilder('recipe')
            .select()
            .where('recipe.id = :id', {id: recipeId})
            .getOne()
            if(!recipe){ 
                throw new NotFoundException(`Receta ${recipeId} no encontrada`)
            }
            await this.saveAll(recipe, ingredientes)
        }
    }

    async deleteIngredients(recipeId: number): Promise<void>{
        const recipeToDelete = await this.recipeRepository.findOne({
            where: {
                id: recipeId,
            },
        });

        if (!recipeToDelete) throw new NotFoundException(`Receta ${recipeId} no encontrada`);
        await this.repository
        .createQueryBuilder()
        .delete()
        .where("receta_id = :recipeId", {recipeId: recipeId})
        .execute()
    }
}