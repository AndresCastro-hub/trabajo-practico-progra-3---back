import { Test, TestingModule } from "@nestjs/testing";
import { CalendarWeekService } from "../../src/modules/calendar/calendar-week.service";
import { CalendarWeekQueryDto } from "../../src/modules/calendar/DTOs/calendar-week-query.dto";
import { CalendarWeekItemDto } from "../../src/modules/calendar/DTOs/calendar-week.dto";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CalendarController } from "../../src/modules/calendar/calendar.controller";
import { JwtAuthGuard } from "../../src/modules/auth/guards/jwt-auth.guard";
import { CalendarService } from "../../src/modules/calendar/calendar.service";
import { calendarDto } from "../../src/modules/calendar/DTOs/calendar.dto";

const mockCalendarService = {
    assignMeal: jest.fn(),
};

const mockCalendarWeekService = {
    getWeekCalendar: jest.fn(),
};

const mockRequest = {
    user: { id: 2, role: "user" },
};

describe("CalendarController", () => {
    let controller: CalendarController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CalendarController],
            providers: [
                { provide: CalendarService, useValue: mockCalendarService },
                { provide: CalendarWeekService, useValue: mockCalendarWeekService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CalendarController>(CalendarController);
    });

    afterEach(() => jest.clearAllMocks());

    describe("assignMeal", () => {

        const dto: calendarDto = {
            receta_id: 1,
            tipo_comida_id: 1,
            fecha: "2026-06-08",
        };

        const mockCalendar = {
            id: 1,
            usuario_id: 2,
            receta_id: 1,
            tipo_comida_id: 1,
            fecha: new Date("2026-06-08"),
        };

        it("debería asignar una comida correctamente", async () => {
            mockCalendarService.assignMeal.mockResolvedValue(mockCalendar);

            const result = await controller.assignMeal(dto, mockRequest as any);

            expect(result).toEqual(mockCalendar);
            expect(mockCalendarService.assignMeal).toHaveBeenCalledWith(dto, mockRequest.user.id);
        });

        it("debería llamar al service con el id del usuario del request", async () => {
            mockCalendarService.assignMeal.mockResolvedValue(mockCalendar);

            await controller.assignMeal(dto, mockRequest as any);

            expect(mockCalendarService.assignMeal).toHaveBeenCalledWith(dto, 2);
            expect(mockCalendarService.assignMeal).toHaveBeenCalledTimes(1);
        });

        it("debería propagar NotFoundException si la receta no existe", async () => {
            mockCalendarService.assignMeal.mockRejectedValue(
                new NotFoundException("La receta con id 1 no existe.")
            );

            await expect(controller.assignMeal(dto, mockRequest as any))
                .rejects.toThrow(NotFoundException);
        });

        it("debería propagar ForbiddenException si la receta no pertenece al usuario", async () => {
            mockCalendarService.assignMeal.mockRejectedValue(
                new ForbiddenException("No tenés permiso para asignar esta receta.")
            );

            await expect(controller.assignMeal(dto, mockRequest as any))
                .rejects.toThrow(ForbiddenException);
        });

        it("debería propagar BadRequestException si ya existe una asignación", async () => {
            mockCalendarService.assignMeal.mockRejectedValue(
                new BadRequestException("Ya existe una receta asignada para ese tipo de comida en ese día.")
            );

            await expect(controller.assignMeal(dto, mockRequest as any))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe("getWeekCalendar", () => {

        const query: CalendarWeekQueryDto = { fecha: "2026-06-08" };

        const mockWeek: CalendarWeekItemDto[] = [
            {
                fecha: "2026-06-08",
                tipo_comida: "Almuerzo",
                titulo: "Milanesa Napolitana",
                descripcion: "Clásica milanesa napolitana",
                imagen: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
                calorias: 850,
                tiempo_preparacion: 45,
            },
            {
                fecha: "2026-06-08",
                tipo_comida: "Cena",
                titulo: "Arroz con Pollo",
                descripcion: "Arroz cremoso con pollo",
                imagen: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
                calorias: 620,
                tiempo_preparacion: 50,
            },
        ];

        it("debería devolver el calendario de la semana", async () => {
            mockCalendarWeekService.getWeekCalendar.mockResolvedValue(mockWeek);

            const result = await controller.getWeekCalendar(query, mockRequest as any);

            expect(result).toEqual(mockWeek);
            expect(mockCalendarWeekService.getWeekCalendar).toHaveBeenCalledWith(query.fecha, mockRequest.user.id);
        });

        it("debería llamar al service con la fecha y el id del usuario correctos", async () => {
            mockCalendarWeekService.getWeekCalendar.mockResolvedValue(mockWeek);

            await controller.getWeekCalendar(query, mockRequest as any);

            expect(mockCalendarWeekService.getWeekCalendar).toHaveBeenCalledWith("2026-06-08", 2);
            expect(mockCalendarWeekService.getWeekCalendar).toHaveBeenCalledTimes(1);
        });

        it("debería devolver un array vacío si no hay comidas asignadas", async () => {
            mockCalendarWeekService.getWeekCalendar.mockResolvedValue([]);

            const result = await controller.getWeekCalendar(query, mockRequest as any);

            expect(result).toEqual([]);
        });

        it("debería devolver múltiples días correctamente", async () => {
            mockCalendarWeekService.getWeekCalendar.mockResolvedValue(mockWeek);

            const result = await controller.getWeekCalendar(query, mockRequest as any);

            expect(result).toHaveLength(2);
        });
    });
});