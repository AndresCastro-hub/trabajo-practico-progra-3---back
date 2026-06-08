import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

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

    @Column()
    tipo_comida_id!: number;
}