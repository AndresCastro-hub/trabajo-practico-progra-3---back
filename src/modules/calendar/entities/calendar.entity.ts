import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Recipe } from "../../recipes/entities/recipe.entity";
import { TipoComida } from "./tipo-comida.entity";

@Entity()
export class Calendar {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    usuario_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "usuario_id" })
    usuario!: User;

    @Column({ type: "date" })
    fecha!: Date;

    @Column()
    receta_id!: number;

    @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "receta_id" })
    receta!: Recipe;

    @Column()
    tipo_comida_id!: number;

    @ManyToOne(() => TipoComida)
    @JoinColumn({ name: "tipo_comida_id" })
    tipoComida!: TipoComida;
}