import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CalendarController } from "../../src/modules/calendar/calendar.controller";
import { JwtAuthGuard } from "../../src/modules/auth/guards/jwt-auth.guard";
import { CreateCalendarDto } from "../../src/modules/calendar/DTOs/create-calendar.dto";
import { CalendarService } from "../../src/modules/calendar/calendar.service";

const mockCalendarService = {
    assignMeal: jest.fn(),
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
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CalendarController>(CalendarController);
    });

    afterEach(() => jest.clearAllMocks());

    describe("assignMeal", () => {

        const dto: CreateCalendarDto = {
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

        it("debería llamar al service con el usuario del request", async () => {
            mockCalendarService.assignMeal.mockResolvedValue(mockCalendar);

            await controller.assignMeal(dto, mockRequest as any);

            expect(mockCalendarService.assignMeal).toHaveBeenCalledWith(dto, 2);
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

        it("debería llamar al service exactamente una vez", async () => {
            mockCalendarService.assignMeal.mockResolvedValue(mockCalendar);

            await controller.assignMeal(dto, mockRequest as any);

            expect(mockCalendarService.assignMeal).toHaveBeenCalledTimes(1);
        });
    });
});