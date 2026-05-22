import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { CreateRecipeDto } from '../DTOs/createRecipe.dto';
import { RecipeResponseDto } from '../DTOs/recipeResponse.dto';


@Injectable()
export class RecipeRepository {
    constructor(
        @InjectRepository(Recipe)
        private repository: Repository<Recipe>
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
}