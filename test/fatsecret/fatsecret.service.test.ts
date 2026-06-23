import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { FatSecretService } from '../../src/modules/fatsecret/fatsecret.service';

const mockTranslationService = {
    traducir: jest.fn(),
};

const mockConfigService = {
    get: jest.fn((key: string) => {
        const config: Record<string, string> = {
            FATSECRET_CLIENT_ID: 'test-client-id',
            FATSECRET_CLIENT_SECRET: 'test-client-secret',
        };
        return config[key];
    }),
};

const mockTokenResponse = {
    access_token: 'fake-token',
    expires_in: 3600,
};

describe('FatSecretService', () => {
    let service: FatSecretService;

    beforeEach(() => {
        service = new FatSecretService(
            mockConfigService as unknown as ConfigService,
            mockTranslationService
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCaloriasPorIngrediente', () => {
        it('retorna las calorías calculadas correctamente para ingrediente en gramos', async () => {
            mockTranslationService.traducir.mockResolvedValue('chicken');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    metric_serving_unit: 'g',
                                    metric_serving_amount: '100',
                                    calories: '200',
                                }],
                            },
                        },
                    }),
                });

            const result = await service.getCaloriasPorIngrediente('pollo', 300, 'g');

            expect(result).toBe(600);
        });

        it('retorna las calorías calculadas para ingrediente por unidad', async () => {
            mockTranslationService.traducir.mockResolvedValue('egg');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: { food_id: '456' } },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    measurement_description: 'large',
                                    calories: '70',
                                }],
                            },
                        },
                    }),
                });

            const result = await service.getCaloriasPorIngrediente('huevo', 2, 'unidad');

            expect(result).toBe(140);
        });
    });

    describe('getToken', () => {
        it('obtiene un nuevo token si no hay uno cacheado', async () => {
            mockTranslationService.traducir.mockResolvedValue('chicken');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    metric_serving_unit: 'g',
                                    metric_serving_amount: '100',
                                    calories: '100',
                                }],
                            },
                        },
                    }),
                });

            await service.getCaloriasPorIngrediente('pollo', 100, 'g');

            expect(global.fetch).toHaveBeenCalledWith(
                'https://oauth.fatsecret.com/connect/token',
                expect.objectContaining({
                    method: 'POST',
                }),
            );
        });

        it('reutiliza el token si no expiró', async () => {
            mockTranslationService.traducir.mockResolvedValue('chicken');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    metric_serving_unit: 'g',
                                    metric_serving_amount: '100',
                                    calories: '100',
                                }],
                            },
                        },
                    }),
                });

            await service.getCaloriasPorIngrediente('pollo', 100, 'g');

            expect((global.fetch as jest.Mock).mock.calls.length).toBe(3);
        });
    });

    describe('buscarFoodId', () => {
        it('lanza NotFoundException si no se encuentra el ingrediente', async () => {
            mockTranslationService.traducir.mockResolvedValue('xyzingrediente');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: {},
                    }),
                });

            await expect(
                service.getCaloriasPorIngrediente('xyz', 100, 'g'),
            ).rejects.toThrow(NotFoundException);
        });

        it('maneja food como objeto en lugar de array', async () => {
            mockTranslationService.traducir.mockResolvedValue('egg');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: { food_id: '789' } },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    metric_serving_unit: 'g',
                                    metric_serving_amount: '100',
                                    calories: '150',
                                }],
                            },
                        },
                    }),
                });

            const result = await service.getCaloriasPorIngrediente('huevo', 100, 'g');

            expect(result).toBe(150);
        });
    });

    describe('obtenerCalorias', () => {
        it('lanza NotFoundException si no hay serving por unidad', async () => {
            mockTranslationService.traducir.mockResolvedValue('egg');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    measurement_description: 'small',
                                    calories: '50',
                                }],
                            },
                        },
                    }),
                });

            await expect(
                service.getCaloriasPorIngrediente('huevo', 1, 'unidad'),
            ).rejects.toThrow(NotFoundException);
        });

        it('lanza NotFoundException si no hay serving en 100g', async () => {
            mockTranslationService.traducir.mockResolvedValue('chicken');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: [{
                                    metric_serving_unit: 'ml',
                                    metric_serving_amount: '100',
                                    calories: '50',
                                }],
                            },
                        },
                    }),
                });

            await expect(
                service.getCaloriasPorIngrediente('pollo', 100, 'g'),
            ).rejects.toThrow(NotFoundException);
        });

        it('maneja serving como objeto en lugar de array', async () => {
            mockTranslationService.traducir.mockResolvedValue('chicken');

            global.fetch = jest.fn()
                .mockResolvedValueOnce({
                    json: async () => mockTokenResponse,
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        foods: { food: [{ food_id: '123' }] },
                    }),
                })
                .mockResolvedValueOnce({
                    json: async () => ({
                        food: {
                            servings: {
                                serving: {
                                    metric_serving_unit: 'g',
                                    metric_serving_amount: '100',
                                    calories: '200',
                                },
                            },
                        },
                    }),
                });

            const result = await service.getCaloriasPorIngrediente('pollo', 200, 'g');

            expect(result).toBe(400);
        });
    });
});