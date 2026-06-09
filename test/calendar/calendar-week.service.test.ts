import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Between } from "typeorm";
import { Calendar } from "../../src/modules/calendar/entities/calendar-entity";
import { CalendarWeekService } from "../../src/modules/calendar/calendar-week.service";

const mockCalendarRepository = {
    find: jest.fn(),
};

const makeMockEntrada = (overrides = {}): Calendar => ({
    id: 1,
    usuario_id: 2,
    receta_id: 1,
    tipo_comida_id: 1,
    fecha: "2026-06-08" as any,
    receta: {
        id: 1,
        nombre: "Milanesa Napolitana",
        descripcion: "Clásica milanesa napolitana",
        imagen_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
        calorias: 850,
        tiempoPreparacion: 45,
        idUsuario: 1,
    } as any,
    tipoComida: { id: 1, nombre: "Almuerzo" } as any,
    usuario: {} as any,
    ...overrides,
});

describe("CalendarWeekService", () => {
    let service: CalendarWeekService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CalendarWeekService,
                { provide: getRepositoryToken(Calendar), useValue: mockCalendarRepository },
            ],
        }).compile();

        service = module.get<CalendarWeekService>(CalendarWeekService);
    });

    afterEach(() => jest.clearAllMocks());

    describe("getWeekCalendar", () => {

        it("debería devolver el calendario mapeado correctamente", async () => {
            const entrada = makeMockEntrada();
            mockCalendarRepository.find.mockResolvedValue([entrada]);

            const result = await service.getWeekCalendar("2026-06-08", 2);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                fecha: "2026-06-08",
                tipo_comida: "Almuerzo",
                titulo: "Milanesa Napolitana",
                descripcion: "Clásica milanesa napolitana",
                imagen: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
                calorias: 850,
                tiempo_preparacion: 45,
            });
        });

        it("debería devolver un array vacío si no hay registros", async () => {
            mockCalendarRepository.find.mockResolvedValue([]);

            const result = await service.getWeekCalendar("2026-06-08", 2);

            expect(result).toEqual([]);
        });

        it("debería llamar al repositorio con el rango de fechas correcto", async () => {
            mockCalendarRepository.find.mockResolvedValue([]);

            await service.getWeekCalendar("2026-06-08", 2);

            const fechaInicio = new Date(2026, 5, 8);
            const fechaFin = new Date(2026, 5, 15);

            expect(mockCalendarRepository.find).toHaveBeenCalledWith({
                where: {
                    usuario_id: 2,
                    fecha: Between(fechaInicio, fechaFin),
                },
                relations: ["receta", "tipoComida"],
                order: { fecha: "ASC" },
            });
        });

        it("debería llamar al repositorio con el usuario correcto", async () => {
            mockCalendarRepository.find.mockResolvedValue([]);

            await service.getWeekCalendar("2026-06-08", 5);

            expect(mockCalendarRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ usuario_id: 5 }),
                })
            );
        });

        it("debería devolver múltiples entradas mapeadas", async () => {
            const entradas = [
                makeMockEntrada({ id: 1, tipo_comida_id: 1, tipoComida: { id: 1, nombre: "Almuerzo" } }),
                makeMockEntrada({ id: 2, tipo_comida_id: 2, tipoComida: { id: 2, nombre: "Cena" }, fecha: "2026-06-09" as any }),
            ];
            mockCalendarRepository.find.mockResolvedValue(entradas);

            const result = await service.getWeekCalendar("2026-06-08", 2);

            expect(result).toHaveLength(2);
            expect(result[0].tipo_comida).toBe("Almuerzo");
            expect(result[1].tipo_comida).toBe("Cena");
        });

        it("debería ordenar por fecha ASC", async () => {
            mockCalendarRepository.find.mockResolvedValue([]);

            await service.getWeekCalendar("2026-06-08", 2);

            expect(mockCalendarRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ order: { fecha: "ASC" } })
            );
        });

        it("debería cargar las relaciones receta y tipoComida", async () => {
            mockCalendarRepository.find.mockResolvedValue([]);

            await service.getWeekCalendar("2026-06-08", 2);

            expect(mockCalendarRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({ relations: ["receta", "tipoComida"] })
            );
        });

        it("debería mapear correctamente la fecha como string YYYY-MM-DD", async () => {
            mockCalendarRepository.find.mockResolvedValue([makeMockEntrada({ fecha: "2026-06-10" as any })]);

            const result = await service.getWeekCalendar("2026-06-08", 2);

            expect(result[0].fecha).toBe("2026-06-10");
            expect(result[0].fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});