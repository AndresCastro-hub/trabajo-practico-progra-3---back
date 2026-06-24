import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { RecipeIngredientRepository } from "../../src/modules/recipes/repositories/recipe-ingredient.repository";
import { RecipeIngredient } from "../../src/modules/recipes/entities/recipe-ingredient.entity";
import { Ingredient } from "../../src/modules/ingredients/entities/ingedients.entity";
import { Recipe } from "../../src/modules/recipes/entities/recipe.entity";
import { IngredientDto } from "../../src/modules/recipes/DTOs/ingredient.dto";
import { editRecipeDto } from "../../src/modules/recipes/DTOs/editRecipe.dto";

const mockQueryBuilder = {
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    getOne: jest.fn(),
};

const mockRecipeIngredientOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockIngredientOrmRepository = {
    findOne: jest.fn(),
};

const mockRecipeOrmRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('RecipeIngredient repository', () => {
    let repository: RecipeIngredientRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeIngredientRepository,
                { provide: getRepositoryToken(RecipeIngredient), useValue: mockRecipeIngredientOrmRepository },
                { provide: getRepositoryToken(Ingredient), useValue: mockIngredientOrmRepository },
                { provide: getRepositoryToken(Recipe), useValue: mockRecipeOrmRepository },
            ],
        }).compile();

        repository = module.get<RecipeIngredientRepository>(RecipeIngredientRepository);
    });

    afterEach(() => jest.clearAllMocks());

    describe('validateIngredients', () => {
        const ingredientesDto: IngredientDto[] = [
            { ingrediente_id: 1, cantidad: 2 }
        ];
        const ingredienteEncontrado = { id: 1, nombre: 'harina', unidad: 'g' };

        it('deberia validar y devolver los ingredientes correctamente', async () => {
            mockIngredientOrmRepository.findOne.mockResolvedValue(ingredienteEncontrado);

            const result = await repository.validateIngredients(ingredientesDto);

            expect(result).toEqual([{ ingrediente: ingredienteEncontrado, cantidad: 2 }]);
            expect(mockIngredientOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('deberia tirar NotFoundException si un ingrediente no existe', async () => {
            mockIngredientOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.validateIngredients(ingredientesDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('saveAll', () => {
        const receta = { id: 1 } as Recipe;
        const ingredientes = [
            { ingrediente: { id: 1, nombre: 'harina', unidad: 'g' } as Ingredient, cantidad: 2 }
        ];

        it('deberia crear y guardar los ingredientes de la receta correctamente', async () => {
            const recipeIngredientCreado = { receta, ingrediente: ingredientes[0].ingrediente, cantidad: 2 };
            mockRecipeIngredientOrmRepository.create.mockReturnValue(recipeIngredientCreado);
            mockRecipeIngredientOrmRepository.save.mockResolvedValue(undefined);

            await repository.saveAll(receta, ingredientes);

            expect(mockRecipeIngredientOrmRepository.create).toHaveBeenCalledWith({
                receta,
                ingrediente: ingredientes[0].ingrediente,
                cantidad: 2
            });
            expect(mockRecipeIngredientOrmRepository.save).toHaveBeenCalledWith([recipeIngredientCreado]);
        });
    });

    describe('deleteRecipeIngredients', () => {
        const recipeId = 1;

        it('deberia eliminar los ingredientes indicados correctamente', async () => {
            const editData: editRecipeDto = { deletedIngredientsId: [1, 2] };
            mockQueryBuilder.execute.mockResolvedValue(undefined);

            await repository.deleteRecipeIngredients(editData, recipeId);

            expect(mockRecipeIngredientOrmRepository.createQueryBuilder).toHaveBeenCalled();
            expect(mockQueryBuilder.delete).toHaveBeenCalled();
            expect(mockQueryBuilder.where).toHaveBeenCalledWith("receta_id = :recipeId", { recipeId });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("ingrediente_id IN (:...ingredientId)", { ingredientId: [1, 2] });
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });

        it('no deberia ejecutar el delete si no hay ingredientes para eliminar', async () => {
            const editData: editRecipeDto = { deletedIngredientsId: [] };

            await repository.deleteRecipeIngredients(editData, recipeId);

            expect(mockQueryBuilder.execute).not.toHaveBeenCalled();
        });

        it('no deberia ejecutar el delete si deletedIngredientsId es undefined', async () => {
            const editData: editRecipeDto = {};

            await repository.deleteRecipeIngredients(editData, recipeId);

            expect(mockQueryBuilder.execute).not.toHaveBeenCalled();
        });
    });

    describe('addRecipeIngredients', () => {
        const recipeId = 1;
        const editData: editRecipeDto = {
            addedIngredients: [{ ingrediente_id: 3, cantidad: 2 }]
        };
        const ingredienteEncontrado = { id: 3, nombre: 'queso', unidad: 'g' };
        const recetaEncontrada = { id: 1 } as Recipe;

        it('deberia agregar los ingredientes correctamente', async () => {
            mockIngredientOrmRepository.findOne.mockResolvedValue(ingredienteEncontrado);
            mockQueryBuilder.getOne.mockResolvedValue(recetaEncontrada);
            mockRecipeIngredientOrmRepository.create.mockReturnValue({});
            mockRecipeIngredientOrmRepository.save.mockResolvedValue(undefined);

            await repository.addRecipeIngredients(editData, recipeId);

            expect(mockRecipeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('recipe');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('recipe.id = :id', { id: recipeId });
            expect(mockRecipeIngredientOrmRepository.save).toHaveBeenCalled();
        });

        it('deberia tirar NotFoundException si no encuentra la receta', async () => {
            mockIngredientOrmRepository.findOne.mockResolvedValue(ingredienteEncontrado);
            mockQueryBuilder.getOne.mockResolvedValue(null);

            await expect(repository.addRecipeIngredients(editData, recipeId)).rejects.toThrow(NotFoundException);
        });

        it('deberia tirar NotFoundException si no encuentra el ingrediente a agregar', async () => {
            mockIngredientOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.addRecipeIngredients(editData, recipeId)).rejects.toThrow(NotFoundException);
        });

        it('no deberia hacer nada si no hay ingredientes para agregar', async () => {
            const editDataVacio: editRecipeDto = { addedIngredients: [] };

            await repository.addRecipeIngredients(editDataVacio, recipeId);

            expect(mockIngredientOrmRepository.findOne).not.toHaveBeenCalled();
        });

        it('no deberia hacer nada si addedIngredients es undefined', async () => {
            const editDataVacio: editRecipeDto = {};

            await repository.addRecipeIngredients(editDataVacio, recipeId);

            expect(mockIngredientOrmRepository.findOne).not.toHaveBeenCalled();
        });
    });

    describe('deleteIngredients', () => {
        const recipeId = 1;
        const recetaEncontrada = { id: 1 } as Recipe;

        it('deberia eliminar los ingredientes de la receta correctamente', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaEncontrada);
            mockQueryBuilder.execute.mockResolvedValue(undefined);

            await repository.deleteIngredients(recipeId);

            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: recipeId } });
            expect(mockQueryBuilder.delete).toHaveBeenCalled();
            expect(mockQueryBuilder.where).toHaveBeenCalledWith("receta_id = :recipeId", { recipeId });
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.deleteIngredients(recipeId)).rejects.toThrow(NotFoundException);
            expect(mockQueryBuilder.execute).not.toHaveBeenCalled();
        });
    });

    describe('updateIngredients', () => {
        const recipeId = 1;
        const editData: editRecipeDto = {
            updatedIngredients: [{ ingrediente_id: 4, cantidad: 5 }]
        };
        const recetaEncontrada = { id: 1 } as Recipe;
        const ingredienteEncontrado = { id: 4, nombre: 'queso', unidad: 'g' };
        const recipeIngredientEncontrado = { id: 10, cantidad: 1, receta: recetaEncontrada, ingrediente: ingredienteEncontrado };

        it('deberia actualizar los ingredientes correctamente', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaEncontrada);
            mockIngredientOrmRepository.findOne.mockResolvedValue(ingredienteEncontrado);
            mockRecipeIngredientOrmRepository.findOne.mockResolvedValue(recipeIngredientEncontrado);
            mockRecipeIngredientOrmRepository.save.mockResolvedValue(undefined);

            await repository.updateIngredients(editData, recipeId);

            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: recipeId } });
            expect(mockIngredientOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 4 } });
            expect(mockRecipeIngredientOrmRepository.findOne).toHaveBeenCalledWith({
                where: { receta: recetaEncontrada, ingrediente: ingredienteEncontrado }
            });
            expect(recipeIngredientEncontrado.cantidad).toBe(5);
            expect(mockRecipeIngredientOrmRepository.save).toHaveBeenCalledWith(recipeIngredientEncontrado);
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.updateIngredients(editData, recipeId)).rejects.toThrow(NotFoundException);
        });

        it('deberia tirar NotFoundException si el ingrediente no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaEncontrada);
            mockIngredientOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.updateIngredients(editData, recipeId)).rejects.toThrow(NotFoundException);
        });

        it('deberia tirar NotFoundException si no encuentra la fila de recipe_ingredient', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaEncontrada);
            mockIngredientOrmRepository.findOne.mockResolvedValue(ingredienteEncontrado);
            mockRecipeIngredientOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.updateIngredients(editData, recipeId)).rejects.toThrow(NotFoundException);
        });

        it('no deberia hacer nada si no hay ingredientes para actualizar', async () => {
            const editDataVacio: editRecipeDto = { updatedIngredients: [] };

            await repository.updateIngredients(editDataVacio, recipeId);

            expect(mockRecipeOrmRepository.findOne).not.toHaveBeenCalled();
        });

        it('no deberia hacer nada si updatedIngredients es undefined', async () => {
            const editDataVacio: editRecipeDto = {};

            await repository.updateIngredients(editDataVacio, recipeId);

            expect(mockRecipeOrmRepository.findOne).not.toHaveBeenCalled();
        });
    });
});