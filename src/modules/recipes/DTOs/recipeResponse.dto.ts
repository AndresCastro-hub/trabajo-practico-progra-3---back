import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  cantidad!: number;

  @ApiProperty()
  ingrediente!: {
    id: number;
    nombre: string;
    unidad: string;
  };
}

export class RecipeResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nombre!: string;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty()
  calorias!: number;

  @ApiProperty()
  tiempoPreparacion!: number;

  @ApiProperty()
  imagen_url!: string;

  @ApiProperty({ type: [IngredientResponseDto] })
  ingredientes!: IngredientResponseDto[];
}