import { Controller, Post, Body, UseGuards, Req, Request } from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCalendarDto } from "./DTOs/create-calendar.dto";
import { RoleGuardDto } from "../auth/dtos/role.dto";
import {  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Calendar")
@ApiBearerAuth()
@Controller("calendar")

@UseGuards(JwtAuthGuard)
export class CalendarController {

    constructor(private readonly calendarService: CalendarService) { }

    @Post()
    @ApiOperation({ summary: "Asignar una receta a un día del calendario" })
    @ApiResponse({ status: 201, description: "Receta asignada correctamente." })
    @ApiResponse({ status: 400, description: "Ya existe una receta asignada para ese tipo de comida en ese día." })
    @ApiResponse({ status: 403, description: "No tenés permiso para asignar esta receta." })
    @ApiResponse({ status: 404, description: "La receta no existe." })
    async assignMeal(@Body() dto: CreateCalendarDto, @Request() req: { user: RoleGuardDto }) {
        return this.calendarService.assignMeal(dto, req.user.id);
    }
}