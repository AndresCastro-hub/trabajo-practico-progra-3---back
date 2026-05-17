import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredients.entity';
import { IngredientsService } from './ingredients.service';
import { IngredientController } from './ingredients.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Ingredient])],
    controllers: [IngredientController],
    providers: [IngredientsService],
})
export class IngredientModule{}
