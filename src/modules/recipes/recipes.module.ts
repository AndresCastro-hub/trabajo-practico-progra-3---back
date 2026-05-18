import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingedients.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
   imports: [
    CloudinaryModule,
    TypeOrmModule.forFeature([Recipe, RecipeIngredient, Ingredient])],
  controllers: [RecipesController],
  providers: [RecipesService]
})
export class RecipesModule {}
