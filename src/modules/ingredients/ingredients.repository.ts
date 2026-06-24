import { InjectRepository } from "@nestjs/typeorm";
import { Ingredient } from "./entities/ingedients.entity";
import { Repository } from "typeorm";
import { createIngredientDto } from "./DTOs/ingredient.dto";
import { IngredientResponseDto } from "./DTOs/ingredientResponse.dto";
import { BadRequestException } from "@nestjs/common";

export class IngredientsRepository {
    constructor(
        @InjectRepository(Ingredient)
        private repository: Repository<Ingredient>,
    ) { }

    public async listarIngredientes(page: number, name?: string): Promise<IngredientResponseDto> {
        const recipesPerPage = Number(process.env.INGREDIENTS_PER_PAGE) || 10
        if(page<1){
            throw new BadRequestException('La pagina tiene que ser mayor o igual a 1');
        }
        const query = this.repository
            .createQueryBuilder('ingredient')
        if(name){
            query.where('ingredient.nombre = :nombre', {nombre: name})
        }
        const [ingredients, count] = await query
            .skip((page -1) * recipesPerPage)
            .take(recipesPerPage)
            .getManyAndCount()

        const ingredientResponse: IngredientResponseDto = {
            ingredients: ingredients,
            totalRecords: count,
            totalPages: Math.ceil(count/recipesPerPage)
        }
        return ingredientResponse
    }

    public async listarTodos(): Promise<Ingredient[]> {
        return await this.repository.find();
    }

    public async crearIngredientes(createIngredientDto: createIngredientDto): Promise<Ingredient> {
        const newIngredient = this.repository.create(createIngredientDto);
        return await this.repository.save(newIngredient)
    }
}