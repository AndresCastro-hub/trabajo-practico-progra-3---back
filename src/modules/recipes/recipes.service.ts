import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { Repository } from 'typeorm';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingedients.entity';
import { CreateRecipeDto } from './DTOs/createRecipe.dto';
import { IngredientDto } from './DTOs/ingredient.dto';
import { RecipeResponseDto } from './DTOs/recipeResponse.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { NutritionService } from '../nutrition/nutrition.interface';
import { NUTRITION_SERVICE } from '../nutrition/nutrition.interface';
import { GetRecipeDto } from './DTOs/getRecipeDto.dto';
import { plainToInstance } from 'class-transformer';
import { RecipeDto } from './DTOs/recipe.dto';
import { GetRecipeIdDto } from './DTOs/getRecipeId.dto';

@Injectable()
export class RecipesService {

    constructor(
        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>,

        @InjectRepository(RecipeIngredient)
        private recipeIngredienteRepository: Repository<RecipeIngredient>,

        @InjectRepository(Ingredient)
        private ingredientRepository: Repository<Ingredient>,

        //Ver como quitar acoplamiento aca
        private cloudinaryService: CloudinaryService,

        @Inject(NUTRITION_SERVICE)
        private nutritionService: NutritionService
    ) { }

    async create(dto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
        const ingredientes = await this.validateIngredients(dto.ingredientes);
        const totalCalorias = await this.calcularCalorias(ingredientes);
        const recetaGuardada = await this.saveRecipe(dto, userId, totalCalorias);
        await this.saveRecipeIngredients(recetaGuardada, ingredientes);
        return this.findRecipeWithRelations(recetaGuardada.id);
    }

    async uploadImage(id: number, imagen: Express.Multer.File): Promise<RecipeResponseDto> {
        if (!imagen) throw new BadRequestException('La imagen es obligatoria');

        const receta = await this.recipeRepository.findOne({ where: { id } });
        if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);

        const imageUrl = await this.cloudinaryService.uploadImage(imagen);
        receta.imagen_url = imageUrl;
        await this.recipeRepository.save(receta);

        return this.findRecipeWithRelations(id);
    }

    private async calcularCalorias(ingredientes: { ingrediente: Ingredient; cantidad: number }[]): Promise<number> {
        const calorias = await Promise.all(
            ingredientes.map(({ ingrediente, cantidad }) =>
                this.nutritionService.getCaloriasPorIngrediente(ingrediente.nombre, cantidad, ingrediente.unidad)
            )
        );
        return Math.round(calorias.reduce((sum, cal) => sum + cal, 0));
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

    private async saveRecipe(dto: CreateRecipeDto, userId: number, calorias: number) {
        const receta = this.recipeRepository.create({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            tiempoPreparacion: dto.tiempoPreparacion,
            calorias: calorias,
            imagen_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmlvsBg8t8ThfFQioT_9g_UBDIMdBcbFbG9g&s',
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

    async getterRecipes(page: number, userId: number, recetasPlataforma: boolean, name?: string): Promise<GetRecipeDto>{
        const recipesPerPage = 6

        const totalcount = await this.recipeRepository
        .createQueryBuilder('recipe')
        .getCount()

        let recipe: Recipe[] = [];
        if(recetasPlataforma){
            recipe = await this.getPlataformRecipes(page, recipesPerPage, name);
        } else{
            recipe = await this.getUserRecipes(page, recipesPerPage, userId, name);
        }

        const getRecipeDto = {
            recipeDto: plainToInstance(RecipeDto, recipe),
            totalRecords: totalcount,
            totalPages: totalcount/recipesPerPage
        }
        return getRecipeDto
    }

    private async getUserRecipes(page: number, recipesPerPage: number, userId: number, name?: string): Promise<Recipe[]>{
        const query = this.recipeRepository
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

        const query = this.recipeRepository
        .createQueryBuilder('recipe')
        .where('recipe.idUsuario = :id', { id: adminId });

        if(name){
            query.andWhere('recipe.nombre ILIKE :nombre', {nombre: `%${name}%`});
        }

        return await query
            .skip(recipesPerPage * page)
            .take(recipesPerPage)
            .getMany()
    }

    async getRecipeById(recipeId: number): Promise<GetRecipeIdDto>{
        const recipe = await this.recipeRepository
        .createQueryBuilder('recipe')
        .where('recipe.id = :id', {id: recipeId})
        .getOne()
        
        return plainToInstance(GetRecipeIdDto, recipe)
    }
}
