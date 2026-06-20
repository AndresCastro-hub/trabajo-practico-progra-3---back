import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CalendarService } from "../../src/modules/calendar/calendar.service";
import { Calendar } from "../../src/modules/calendar/entities/calendar-entity";
import { Recipe } from "../../src/modules/recipes/entities/recipe.entity";
import { TipoComida } from "../../src/modules/calendar/entities/tipo-comida-entity";
import { CreateCalendarDto } from "../../src/modules/calendar/DTOs/calendar.dto";

const mockCalendarRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockRecipeRepository = {
    findOne: jest.fn(),
};

const mockTipoComidaRepository = {
    findOne: jest.fn(),
};

describe("CalendarService", () => {
    let service: CalendarService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CalendarService,
                { provide: getRepositoryToken(Calendar), useValue: mockCalendarRepository },
                { provide: getRepositoryToken(Recipe), useValue: mockRecipeRepository },
                { provide: getRepositoryToken(TipoComida), useValue: mockTipoComidaRepository },
            ],
        }).compile();

        service = module.get<CalendarService>(CalendarService);
    });

    afterEach(() => jest.clearAllMocks());

    const dto: CreateCalendarDto = {
        receta_id: 1,
        tipo_comida_id: 1,
        fecha: "2026-06-08",
    };

    const mockTipoComida: TipoComida = { id: 1, nombre: "Almuerzo" };

    const mockRecetaPropia: Partial<Recipe> = { id: 1, idUsuario: 2 };
    const mockRecetaPlataforma: Partial<Recipe> = { id: 2, idUsuario: 1 };
    const mockRecetaAjena: Partial<Recipe> = { id: 3, idUsuario: 99 };

    const mockCalendar: Partial<Calendar> = {
        id: 1,
        usuario_id: 2,
        receta_id: 1,
        tipo_comida_id: 1,
        fecha: new Date("2026-06-08"),
    };

    describe("assignMeal", () => {

        it("debería asignar correctamente una receta propia", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(mockRecetaPropia);
            mockCalendarRepository.findOne.mockResolvedValue(null);
            mockCalendarRepository.create.mockReturnValue(mockCalendar);
            mockCalendarRepository.save.mockResolvedValue(mockCalendar);

            const result = await service.assignMeal(dto, 2);

            expect(result).toEqual(mockCalendar);
            expect(mockCalendarRepository.save).toHaveBeenCalledTimes(1);
        });

        it("debería asignar correctamente una receta de la plataforma", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(mockRecetaPlataforma);
            mockCalendarRepository.findOne.mockResolvedValue(null);
            mockCalendarRepository.create.mockReturnValue(mockCalendar);
            mockCalendarRepository.save.mockResolvedValue(mockCalendar);

            const result = await service.assignMeal(dto, 2);

            expect(result).toEqual(mockCalendar);
        });

        it("debería lanzar NotFoundException si el tipo de comida no existe", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(null);

            await expect(service.assignMeal(dto, 2))
                .rejects.toThrow(NotFoundException);

            expect(mockRecipeRepository.findOne).not.toHaveBeenCalled();
        });

        it("debería lanzar NotFoundException si la receta no existe", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(null);

            await expect(service.assignMeal(dto, 2))
                .rejects.toThrow(NotFoundException);

            expect(mockCalendarRepository.findOne).not.toHaveBeenCalled();
        });

        it("debería lanzar ForbiddenException si la receta es ajena", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(mockRecetaAjena);

            await expect(service.assignMeal(dto, 2))
                .rejects.toThrow(ForbiddenException);

            expect(mockCalendarRepository.findOne).not.toHaveBeenCalled();
        });

        it("debería lanzar BadRequestException si ya existe una asignación para ese día y tipo de comida", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(mockRecetaPropia);
            mockCalendarRepository.findOne.mockResolvedValue(mockCalendar);

            await expect(service.assignMeal(dto, 2))
                .rejects.toThrow(BadRequestException);

            expect(mockCalendarRepository.save).not.toHaveBeenCalled();
        });

        it("debería crear el calendario con los datos correctos", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(mockTipoComida);
            mockRecipeRepository.findOne.mockResolvedValue(mockRecetaPropia);
            mockCalendarRepository.findOne.mockResolvedValue(null);
            mockCalendarRepository.create.mockReturnValue(mockCalendar);
            mockCalendarRepository.save.mockResolvedValue(mockCalendar);

            await service.assignMeal(dto, 2);

            // Fix: usar el mismo parseo que el service
            const [year, month, day] = dto.fecha.split("-").map(Number);
            const fechaEsperada = new Date(year, month - 1, day);

            expect(mockCalendarRepository.create).toHaveBeenCalledWith({
                usuario_id: 2,
                receta_id: dto.receta_id,
                tipo_comida_id: dto.tipo_comida_id,
                fecha: fechaEsperada,
            });
        });

        it("no debería guardar si la validación de tipo de comida falla", async () => {
            mockTipoComidaRepository.findOne.mockResolvedValue(null);

            await expect(service.assignMeal(dto, 2)).rejects.toThrow(NotFoundException);

            expect(mockCalendarRepository.save).not.toHaveBeenCalled();
        });
    });
});