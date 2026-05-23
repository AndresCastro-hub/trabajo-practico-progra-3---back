import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class IngredientTranslation{
    @PrimaryGeneratedColumn()
    id!:number

    @Column({unique: true})
    nombreEspanol!: string;

    @Column()
    nombreIngles!:string
}