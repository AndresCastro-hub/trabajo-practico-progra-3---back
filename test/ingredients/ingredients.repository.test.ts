import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsRepository } from '../../src/modules/ingredients/ingredients.repository';
import { Ingredient } from '../../src/modules/ingredients/entities/ingedients.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createIngredientDto } from '../../src/modules/ingredients/DTOs/ingredient.dto';
import { BadRequestException } from '@nestjs/common';

const mockIngredient: Ingredient = {
    id: 1,
    nombre: 'Tomate',
    unidad: 'g',
};

const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
};

const mockTypeOrmRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('IngredientsRepository', () => {
    let repositoryService: IngredientsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngredientsRepository,
                {
                    provide: getRepositoryToken(Ingredient),
                    useValue: mockTypeOrmRepository,
                },
            ],
        }).compile();

        repositoryService = module.get<IngredientsRepository>(IngredientsRepository);
        jest.clearAllMocks();
    });

    describe('listarIngredientes', () => {
        it('debería retornar paginación correctamente sin filtro de nombre', async () => {
            const page = 1;
            const count = 15;
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockIngredient], count]);

            const result = await repositoryService.listarIngredientes(page);

            expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('ingredient');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.where).not.toHaveBeenCalled();

            expect(result).toEqual({
                ingredients: [mockIngredient],
                totalRecords: count,
                totalPages: 2,
            });
        });

        it('debería aplicar el filtro where si se provee un nombre', async () => {
            const page = 2;
            const name = 'Tomate';
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockIngredient], 1]);

            const result = await repositoryService.listarIngredientes(page, name);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith('ingredient.nombre = :nombre', { nombre: name });
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(result.totalPages).toBe(1);
        });

        it('debería lanzar BadRequestException si la página es menor a 1', async () => {
            await expect(repositoryService.listarIngredientes(0)).rejects.toThrow(BadRequestException);
            await expect(repositoryService.listarIngredientes(-1)).rejects.toThrow(BadRequestException);

            expect(mockTypeOrmRepository.createQueryBuilder).not.toHaveBeenCalled();
        });
    });

    describe('listarTodos', () => {
        it('debería retornar todos los ingredientes llamando a find()', async () => {
            mockTypeOrmRepository.find.mockResolvedValue([mockIngredient]);

            const result = await repositoryService.listarTodos();

            expect(mockTypeOrmRepository.find).toHaveBeenCalled();
            expect(result).toEqual([mockIngredient]);
        });
    });

    describe('crearIngredientes', () => {
        it('debería crear y guardar un ingrediente correctamente', async () => {
            const dto: createIngredientDto = { nombre: 'Tomate', unidad: 'g' };
            mockTypeOrmRepository.create.mockReturnValue(mockIngredient);
            mockTypeOrmRepository.save.mockResolvedValue(mockIngredient);

            const result = await repositoryService.crearIngredientes(dto);

            expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
            expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockIngredient);
            expect(result).toEqual(mockIngredient);
        });
    });
});