import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingedients.entity';
import { IngredientsRepository } from './ingredients.repository';
import { IngredientController } from './ingredients.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Ingredient])],
    controllers: [IngredientController],
    providers: [IngredientsRepository],
})
export class IngredientModule{}
