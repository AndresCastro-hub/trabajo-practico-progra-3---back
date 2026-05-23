import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingedients.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FatSecretModule } from '../fatsecret/fatsecret.module';
import { RecipeRepository } from './repositories/recipe.repository';
import { RecipeIngredientRepository } from './repositories/recipe-ingredient.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    FatSecretModule,
    CloudinaryModule,
    UsersModule,
    TypeOrmModule.forFeature([Recipe, RecipeIngredient, Ingredient])
  ],
  controllers: [RecipesController],
  providers: [RecipesService, RecipeRepository, RecipeIngredientRepository]
})
export class RecipesModule {}