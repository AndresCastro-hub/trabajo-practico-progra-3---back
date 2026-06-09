import { IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CalendarWeekQueryDto {

    @ApiProperty({ example: "2026-06-08" })
    @IsDateString()
    fecha!: string;
}