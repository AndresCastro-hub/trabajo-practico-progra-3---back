import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsInt, IsNotEmpty } from "class-validator"

export class deleteCalendarDto {

    @ApiProperty({ example: 1, description: "ID del tipo de comida (ej: 1=Almuerzo, 2=Cena)" })
    @IsInt()
    @IsNotEmpty()
    tipo_comida_id!: number

    @ApiProperty({ example: "2024-06-08", description: "Fecha del día en formato YYYY-MM-DD" })
    @IsDateString()
    @IsNotEmpty()
    fecha!: string
}