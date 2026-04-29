import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    @Exclude()
    passwordHashed!: string;

    @Column()
    rolId!: number;

    @Column()
    fechaCreacion!: Date;
}
