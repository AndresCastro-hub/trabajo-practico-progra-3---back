import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { CreateRecipeDto } from '../DTOs/createRecipe.dto';
import { RecipeResponseDto } from '../DTOs/recipeResponse.dto';
import { GetRecipeIdDto } from '../DTOs/getRecipeId.dto';
import { plainToInstance } from 'class-transformer';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { editRecipeDto } from '../DTOs/editRecipe.dto';


@Injectable()
export class RecipeRepository {
    constructor(
        @InjectRepository(Recipe)
        private repository: Repository<Recipe>,
        @InjectRepository(RecipeIngredient)
        private recipeIngredientRepository: Repository<RecipeIngredient>
    ) {}

    async save(dto: CreateRecipeDto, userId: number, calorias: number): Promise<Recipe> {
        const receta = this.repository.create({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            tiempoPreparacion: dto.tiempoPreparacion,
            calorias,
            imagen_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmlvsBg8t8ThfFQioT_9g_UBDIMdBcbFbG9g&s',
            idUsuario: userId
        });
        return this.repository.save(receta);
    }

    async updateImageUrl(id: number, imageUrl: string): Promise<void> {
        const receta = await this.repository.findOne({ where: { id } });
        if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);
        receta.imagen_url = imageUrl;
        await this.repository.save(receta);
    }

    async findWithRelations(id: number): Promise<RecipeResponseDto> {
        const receta = await this.repository.findOne({
            where: { id },
            relations: ['ingredientes', 'ingredientes.ingrediente'],
        });
        if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);
        return receta;
    }

    public useRepository(): Repository<Recipe>{
        return this.repository
    }

    async validateUser(recipeId: number, userId: number): Promise<void>{
        const recipe = await this.getRecipeById(recipeId);
        if(recipe.idUsuario !== userId){
            throw new BadRequestException(`La receta con id: ${recipeId} no pertenece al usuario con id: ${userId}`);
        }
    }

    async getRecipeById(recipeId: number): Promise<GetRecipeIdDto>{
        const recipe = await this.repository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.ingredientes', 'ingredientes')
        .leftJoinAndSelect('ingredientes.ingrediente', 'detalleIngredientes')
        .where('recipe.id = :id', {id: recipeId})
        .getOne()
            
        if(!recipe){
            throw new NotFoundException(`la receta con el id: ${recipeId} no existe`)
        }
        return plainToInstance(GetRecipeIdDto, recipe)
    }

    
    async edit(editData: editRecipeDto, recipeId: number): Promise<void>{
        const recipeToEdit = await this.repository.findOneBy({
            id: recipeId,
        })

        if(!recipeToEdit){
            throw new NotFoundException(`la receta con el id: ${recipeId} no existe`)
        }

        if(editData.description){
            recipeToEdit.descripcion = editData.description
        }
        if(editData.prepTime){
            recipeToEdit.tiempoPreparacion = editData.prepTime
        }
        
        await this.repository.save(recipeToEdit)
    }

    async getRecipes(page: number, userId: number, recetasPlataforma: boolean, name?: string): Promise<{recipe:Recipe[], totalCount: number}>{
        const recipesPerPage = 6

        let recipe: Recipe[] = [];
        let count: number = 0;
        if(recetasPlataforma){
            recipe = (await this.getPlataformRecipes(page, recipesPerPage, name)).recipe;
            count = (await this.getPlataformRecipes(page, recipesPerPage, name)).totalCount;
        } else{
            recipe = (await this.getUserRecipes(page, recipesPerPage, userId, name)).recipe;
            count = (await this.getUserRecipes(page, recipesPerPage,userId, name)).totalCount;
        }

        if (!recipe || recipe.length === 0) {
            throw new NotFoundException(`No hay registros de recetas disponibles`);
        }
        
        return {
            recipe: recipe,
            totalCount: count
        }
    }

    private async getUserRecipes(page: number, recipesPerPage: number, userId: number, name?: string): Promise<{recipe:Recipe[], totalCount: number}>{
        const query = this.repository
            .createQueryBuilder('recipe')
            .where('recipe.idUsuario = :id', {id: userId});
        
        if(name){
            query.andWhere('recipe.nombre ILIKE :nombre', {nombre: `%${name}%`});
            if(!query){
                throw new NotFoundException(`No existen recetas que contengan el nombre: ${name}`);
            }
        }

        const [recipes, count] = await query
        .skip(recipesPerPage * page)
        .take(recipesPerPage)
        .getManyAndCount()
        
        return {
            recipe: recipes,
            totalCount: count
        }
    }

    private async getPlataformRecipes(page: number, recipesPerPage: number, name?: string): Promise<{recipe:Recipe[], totalCount: number}>{
        const adminId = 1

        const query = this.repository
        .createQueryBuilder('recipe')
        .where('recipe.idUsuario = :id', { id: adminId });

        if(name){
            query.andWhere('recipe.nombre ILIKE :nombre', {nombre: `%${name}%`});
            if(!query){
                throw new NotFoundException(`No existen recetas que contengan el nombre: ${name}`);
            }
        }
        
        const [recipes, count] = await query
        .skip(recipesPerPage * page)
        .take(recipesPerPage)
        .getManyAndCount()
        
        return {
            recipe: recipes,
            totalCount: count
        }
    }
}