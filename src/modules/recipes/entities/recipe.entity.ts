import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { RecipeIngredient } from "./recipe-ingredient.entity";

@Entity()
export class Recipe {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 25 })
    nombre!: string

    @Column({ type: 'text', nullable: true })
    descripcion?: string

    @Column({ type: 'integer', default: 0 })
    calorias!: number

    @Column({ type: 'integer', default: 0 })
    tiempoPreparacion!: number

    @Column({ type: 'varchar', length: 500 })
    imagen_url!: string;

    @Column()
    idUsuario!: number;

    @OneToMany(() => RecipeIngredient, (ri) => ri.receta, { cascade: true })
    ingredientes!: RecipeIngredient[];
}