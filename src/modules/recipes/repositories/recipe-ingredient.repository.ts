import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { Ingredient } from '../../ingredients/entities/ingedients.entity';
import { Recipe } from '../entities/recipe.entity';
import { IngredientDto } from '../DTOs/ingredient.dto';

@Injectable()
export class RecipeIngredientRepository {
    constructor(
        @InjectRepository(RecipeIngredient)
        private repository: Repository<RecipeIngredient>,

        @InjectRepository(Ingredient)
        private ingredientRepository: Repository<Ingredient>
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
}