import { Test, TestingModule } from '@nestjs/testing';
import { IngredientController } from '../../src/modules/ingredients/ingredients.controller';
import { IngredientsRepository } from '../../src/modules/ingredients/ingredients.repository';
import { Ingredient } from '../../src/modules/ingredients/entities/ingedients.entity';
import { createIngredientDto } from '../../src/modules/ingredients/DTOs/ingredient.dto';
import { IngredientResponseDto } from '../../src/modules/ingredients/DTOs/ingredientResponse.dto';

const mockIngredient: Ingredient = {
    id: 1,
    nombre: 'Tomate',
    unidad: 'g',
};

const mockIngredientResponse: IngredientResponseDto = {
    ingredients: [mockIngredient],
    totalRecords: 1,
    totalPages: 1,
};

const mockIngredientsRepository = {
    listarIngredientes: jest.fn(),
    crearIngredientes: jest.fn(),
    listarTodos: jest.fn(),
};

describe('IngredientController', () => {
    let controller: IngredientController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IngredientController],
            providers: [
            { provide: IngredientsRepository, useValue: mockIngredientsRepository },
            ],
        }).compile();

        controller = module.get<IngredientController>(IngredientController);
        jest.clearAllMocks();
    });

    describe('getIngredientes', () => {
        it('debería llamar a listarIngredientes del repositorio con los parámetros correctos', async () => {
            mockIngredientsRepository.listarIngredientes.mockResolvedValue(mockIngredientResponse);
            const page = 1;
            const name = 'Tomate';

            const result = await controller.getIngredientes(page, name);

            expect(mockIngredientsRepository.listarIngredientes).toHaveBeenCalledWith(page, name);
            expect(result).toEqual(mockIngredientResponse);
        });
    });

    describe('postIngredientes', () => {
        it('debería llamar a crearIngredientes y retornar el ingrediente creado', async () => {
            mockIngredientsRepository.crearIngredientes.mockResolvedValue(mockIngredient);
            const dto: createIngredientDto = { nombre: 'Tomate', unidad: 'g' };

            const result = await controller.postIngredientes(dto);

            expect(mockIngredientsRepository.crearIngredientes).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockIngredient);
        });
    });

    describe('getAll', () => {
        it('debería llamar a listarTodos y retornar la lista completa', async () => {
            const mockList = [mockIngredient];
            mockIngredientsRepository.listarTodos.mockResolvedValue(mockList);

            const result = await controller.getAll();

            expect(mockIngredientsRepository.listarTodos).toHaveBeenCalled();
            expect(result).toEqual(mockList);
        });
    });
});