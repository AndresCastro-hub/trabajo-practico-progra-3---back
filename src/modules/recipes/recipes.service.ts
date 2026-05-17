import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { Repository } from 'typeorm';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingedients.entity';
import { CreateRecipeDto } from './DTOs/createRecipe.dto';
import { IngredientDto } from './DTOs/ingredient.dto';
import { RecipeResponseDto } from './DTOs/recipeResponse.dto';

@Injectable()
export class RecipesService {

    constructor(
        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>,

        @InjectRepository(RecipeIngredient)
        private recipeIngredienteRepository: Repository<RecipeIngredient>,

        @InjectRepository(Ingredient)
        private ingredientRepository: Repository<Ingredient>
    ) { }

    async create(dto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
        const ingredientes = await this.validateIngredients(dto.ingredientes);
        const recetaGuardada = await this.saveRecipe(dto, userId);
        await this.saveRecipeIngredients(recetaGuardada, ingredientes);
        return this.findRecipeWithRelations(recetaGuardada.id);
    }

    private async validateIngredients(ingredients: IngredientDto[]) {
        return Promise.all(
            ingredients.map(async (i) => {
                const ingrediente = await this.ingredientRepository.findOne({ where: { id: i.ingredient_id } });
                if (!ingrediente) throw new NotFoundException(`Ingrediente ${i.ingredient_id} no encontrado`);
                return { ingrediente, cantidad: i.cantidad };
            }),
        );
    }

    private async saveRecipe(dto: CreateRecipeDto, userId: number) {
        const receta = this.recipeRepository.create({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            tiempoPreparacion: dto.tiempoPreparacion,
            calorias: 0,
            imagen_url: 'harcodeado_test.jpg',
            idUsuario: userId
        })
        return this.recipeRepository.save(receta)
    }

    private async saveRecipeIngredients(receta: Recipe, ingredientes: { ingrediente: Ingredient; cantidad: number }[]) {
        const recipeIngredients = ingredientes.map(({ ingrediente, cantidad }) =>
            this.recipeIngredienteRepository.create({ receta, ingrediente, cantidad }),
        );
        return this.recipeIngredienteRepository.save(recipeIngredients);
    }

    private async findRecipeWithRelations(id: number): Promise<RecipeResponseDto> {
        const receta = await this.recipeRepository.findOne({
            where: { id },
            relations: ['ingredientes', 'ingredientes.ingrediente'],
        });

        if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);

        return receta;
    }
}
