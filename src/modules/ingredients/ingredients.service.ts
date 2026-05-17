import { InjectRepository } from "@nestjs/typeorm";
import { Ingredient } from "./entities/ingredients.entity";
import { Repository } from "typeorm";
import { createIngredientDto } from "./DTOs/ingredientDto";

export class IngredientsService{
    constructor(
        @InjectRepository(Ingredient)
        private ingredientrepository: Repository<Ingredient>,
    ){}

    public async listarIngredientes(limit: number, offset: number): Promise <Ingredient[]>{
        return await this.ingredientrepository
        .createQueryBuilder("ingredient")
        .select("ingredient")
        .limit(limit)
        .offset(offset)
        .getMany()
    }

    public async crearIngredientes(createIngredientDto: createIngredientDto): Promise <Ingredient>{
        const newIngredient = this.ingredientrepository.create(createIngredientDto);
        return await this.ingredientrepository.save(newIngredient)
    }
}