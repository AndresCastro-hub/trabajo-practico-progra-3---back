import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingedients.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredientes)
  @JoinColumn({ name: 'receta_id' })
  receta!: Recipe;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente!: Ingredient;

  @Column({ type: 'decimal' })
  cantidad!: number;
}