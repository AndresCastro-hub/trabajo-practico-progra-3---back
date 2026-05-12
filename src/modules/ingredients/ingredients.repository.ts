import { InjectRepository } from "@nestjs/typeorm";
import { Ingredient } from "./entities/ingedients.entity";
import { Repository } from "typeorm";

export class IngredientsRepository{
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
}