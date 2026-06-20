import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tipo_comida")
export class TipoComida {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    nombre!: string;
}