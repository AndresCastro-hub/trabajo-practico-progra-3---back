import { ApiProperty } from "@nestjs/swagger";

export class CalendarWeekItemDto {

    @ApiProperty({ example: "2024-06-08" })
    fecha!: string;


    @ApiProperty({ example: "Almuerzo" })
    tipo_comida!: string;

    @ApiProperty({ example: "Milanesa con papas fritas" })
    titulo!: string;

    @ApiProperty({ example: "Milanesa napolitana con papas fritas,etc.." })
    descripcion!: string;

    @ApiProperty({ example: "imagen de la receta" })
    imagen!: string;

    @ApiProperty({ example: 450 })
    calorias!: number;

    @ApiProperty({ example: "30 expresdo en minuto" })
    tiempo_preparacion!: number;

}