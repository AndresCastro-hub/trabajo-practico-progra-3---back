import { Controller, Post, Body, UseGuards, Req, Request, Get, Query } from "@nestjs/common";
import { Controller, Post, Body, UseGuards, Req, Request } from "@nestjs/common";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCalendarDto } from "./DTOs/create-calendar.dto";
import { RoleGuardDto } from "../auth/dtos/role.dto";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CalendarWeekService } from "./calendar-week.service";
import { CalendarWeekItemDto } from "./DTOs/calendar-week.dto";
import { CalendarWeekQueryDto } from "./DTOs/calendar-week-query.dto";
import {  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Calendar")
@ApiBearerAuth()
@Controller("calendar")

@UseGuards(JwtAuthGuard)
export class CalendarController {

    constructor(
        private readonly calendarService: CalendarService,
        private readonly calendarWeekService: CalendarWeekService,
    ) { }

    @Post()
    @ApiOperation({ summary: "Asignar una receta a un día del calendario" })
    @ApiResponse({ status: 201, description: "Receta asignada correctamente." })
    @ApiResponse({ status: 400, description: "Ya existe una receta asignada para ese tipo de comida en ese día." })
    @ApiResponse({ status: 403, description: "No tenés permiso para asignar esta receta." })
    @ApiResponse({ status: 404, description: "La receta no existe." })
    async assignMeal(@Body() dto: CreateCalendarDto, @Request() req: { user: RoleGuardDto }) {
        return this.calendarService.assignMeal(dto, req.user.id);
    }

    @Get("week")
    @ApiOperation({ summary: "Obtener el calendario de los próximos 7 días" })
    @ApiQuery({ name: "fecha", example: "2024-06-08", description: "Fecha de inicio en formato YYYY-MM-DD" })
    @ApiResponse({ status: 200, description: "Listado de comidas de la semana.", type: [CalendarWeekItemDto] })
    async getWeekCalendar(@Query() query: CalendarWeekQueryDto, @Request() req: { user: RoleGuardDto }) {
        return this.calendarWeekService.getWeekCalendar(query.fecha, req.user.id);
    }
}