import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { RecipeRepository } from "../../src/modules/recipes/repositories/recipe.repository";
import { Recipe } from "../../src/modules/recipes/entities/recipe.entity";
import { CreateRecipeDto } from "../../src/modules/recipes/DTOs/createRecipe.dto";
import { editRecipeDto } from "../../src/modules/recipes/DTOs/editRecipe.dto";

const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
};

const mockRecipeOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('Recipe repository', () => {
    let repository: RecipeRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeRepository,
                { provide: getRepositoryToken(Recipe), useValue: mockRecipeOrmRepository },
            ],
        }).compile();

        repository = module.get<RecipeRepository>(RecipeRepository);
        process.env.RECIPES_PER_PAGE = '6';
        process.env.ADMIN_USER_ID = '1';
    });

    afterEach(() => jest.clearAllMocks());

    describe('save', () => {
        const dto: CreateRecipeDto = {
            nombre: 'alejo',
            descripcion: 'asdasd',
            tiempoPreparacion: 1,
            ingredientes: []
        };
        const userId = 2;
        const calorias = 100;

        it('deberia crear y guardar la receta correctamente', async () => {
            const recetaCreada = { ...dto, calorias, idUsuario: userId };
            mockRecipeOrmRepository.create.mockReturnValue(recetaCreada);
            mockRecipeOrmRepository.save.mockResolvedValue({ id: 1, ...recetaCreada });

            const result = await repository.save(dto, userId, calorias);

            expect(mockRecipeOrmRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                tiempoPreparacion: dto.tiempoPreparacion,
                calorias,
                idUsuario: userId
            }));
            expect(mockRecipeOrmRepository.save).toHaveBeenCalledWith(recetaCreada);
            expect(result).toEqual({ id: 1, ...recetaCreada });
        });
    });

    describe('updateImageUrl', () => {
        const id = 1;
        const imageUrl = 'http://image-url.com/foto.jpg';

        it('deberia actualizar la url de la imagen correctamente', async () => {
            const receta = { id, imagen_url: 'old-url' };
            mockRecipeOrmRepository.findOne.mockResolvedValue(receta);
            mockRecipeOrmRepository.save.mockResolvedValue({ ...receta, imagen_url: imageUrl });

            await repository.updateImageUrl(id, imageUrl);

            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(receta.imagen_url).toBe(imageUrl);
            expect(mockRecipeOrmRepository.save).toHaveBeenCalledWith(receta);
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.updateImageUrl(id, imageUrl)).rejects.toThrow(NotFoundException);
            expect(mockRecipeOrmRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findWithRelations', () => {
        const id = 1;
        const recetaConRelaciones = {
            id,
            nombre: 'string',
            descripcion: 'string',
            calorias: 1,
            tiempoPreparacion: 1,
            imagen_url: 'string',
            ingredientes: []
        };

        it('deberia devolver la receta con sus relaciones correctamente', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaConRelaciones);

            const result = await repository.findWithRelations(id);

            expect(result).toEqual(recetaConRelaciones);
            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({
                where: { id },
                relations: ['ingredientes', 'ingredientes.ingrediente'],
            });
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.findWithRelations(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('validateUser', () => {
        const recipeId = 1;
        const userId = 2;

        it('no deberia tirar ningun error si la receta pertenece al usuario', async () => {
            mockQueryBuilder.getOne.mockResolvedValue({ id: recipeId, idUsuario: userId });

            await expect(repository.validateUser(recipeId, userId)).resolves.toBeUndefined();
        });

        it('deberia tirar BadRequestException si la receta no pertenece al usuario', async () => {
            mockQueryBuilder.getOne.mockResolvedValue({ id: recipeId, idUsuario: 99 });

            await expect(repository.validateUser(recipeId, userId)).rejects.toThrow(BadRequestException);
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockQueryBuilder.getOne.mockResolvedValue(null);

            await expect(repository.validateUser(recipeId, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getRecipeById', () => {
        const recipeId = 1;
        const recetaEncontrada = {
            id: recipeId,
            nombre: 'Milanesa',
            descripcion: 'Con fritas',
            calorias: 500,
            tiempoPreparacion: 30,
            imagen_url: 'http://example.com/mila.jpg',
            idUsuario: 2,
            ingredientes: []
        };

        it('deberia devolver la receta por su ID correctamente', async () => {
            mockQueryBuilder.getOne.mockResolvedValue(recetaEncontrada);

            const result = await repository.getRecipeById(recipeId);

            expect(result).toEqual(expect.objectContaining({ nombre: 'Milanesa', idUsuario: 2 }));
            expect(mockRecipeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('recipe');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('recipe.id = :id', { id: recipeId });
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockQueryBuilder.getOne.mockResolvedValue(null);

            await expect(repository.getRecipeById(recipeId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('edit', () => {
        const recipeId = 1;
        const recetaExistente = { id: recipeId, descripcion: 'vieja', tiempoPreparacion: 10 };

        it('deberia editar la descripcion y el tiempo de preparacion correctamente', async () => {
            const editData: editRecipeDto = { description: 'nueva descripcion', prepTime: 45 };
            mockRecipeOrmRepository.findOneBy.mockResolvedValue({ ...recetaExistente });
            mockRecipeOrmRepository.save.mockResolvedValue(undefined);

            await repository.edit(editData, recipeId);

            expect(mockRecipeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: recipeId });
            expect(mockRecipeOrmRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ descripcion: 'nueva descripcion', tiempoPreparacion: 45 })
            );
        });

        it('no deberia modificar los campos no enviados', async () => {
            const editData: editRecipeDto = {};
            mockRecipeOrmRepository.findOneBy.mockResolvedValue({ ...recetaExistente });
            mockRecipeOrmRepository.save.mockResolvedValue(undefined);

            await repository.edit(editData, recipeId);

            expect(mockRecipeOrmRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ descripcion: 'vieja', tiempoPreparacion: 10 })
            );
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOneBy.mockResolvedValue(null);

            await expect(repository.edit({}, recipeId)).rejects.toThrow(NotFoundException);
            expect(mockRecipeOrmRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getRecipes', () => {
        const page = 1;
        const userId = 2;
        const recetas = [{ id: 1, nombre: 'Milanesa' }];

        it('deberia devolver las recetas de la plataforma correctamente', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([recetas, 1]);

            const result = await repository.getRecipes(page, userId, true);

            expect(result).toEqual({ recipe: recetas, totalCount: 1 });
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('recipe.idUsuario = :id', { id: 1 });
        });

        it('deberia devolver las recetas del usuario correctamente', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([recetas, 1]);

            const result = await repository.getRecipes(page, userId, false);

            expect(result).toEqual({ recipe: recetas, totalCount: 1 });
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('recipe.idUsuario = :id', { id: userId });
        });

        it('deberia filtrar por nombre cuando se proporciona', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([recetas, 1]);

            await repository.getRecipes(page, userId, false, 'Milanesa');

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recipe.nombre ILIKE :nombre', { nombre: '%Milanesa%' });
        });

        it('deberia tirar NotFoundException si no hay recetas disponibles', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await expect(repository.getRecipes(page, userId, true)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteRecipe', () => {
        const recipeId = 1;
        const recetaAEliminar = {
            id: recipeId,
            nombre: 'string',
            descripcion: 'string',
            calorias: 1,
            tiempoPreparacion: 1,
            imagen_url: 'string',
            ingredientes: []
        };

        it('deberia eliminar la receta correctamente', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaAEliminar);
            mockRecipeOrmRepository.remove.mockResolvedValue(undefined);

            const result = await repository.deleteRecipe(recipeId);

            expect(result).toEqual(expect.objectContaining({ id: recipeId, nombre: 'string' }));
            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({
                where: { id: recipeId },
                relations: ['ingredientes', 'ingredientes.ingrediente'],
            });
            expect(mockRecipeOrmRepository.remove).toHaveBeenCalledWith(recetaAEliminar);
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.deleteRecipe(recipeId)).rejects.toThrow(NotFoundException);
            expect(mockRecipeOrmRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('updateRecipeCalories', () => {
        it('deberia actualizar las calorias de la receta correctamente', async () => {
            const recipe = { id: 1, calorias: 100 } as Recipe;
            mockRecipeOrmRepository.save.mockResolvedValue(undefined);

            await repository.updateRecipeCalories(250, recipe);

            expect(recipe.calorias).toBe(250);
            expect(mockRecipeOrmRepository.save).toHaveBeenCalledWith(recipe);
        });
    });

    describe('getRecipeEntityById', () => {
        const recipeId = 1;
        const recetaEncontrada = { id: recipeId, ingredientes: [] };

        it('deberia devolver la receta con sus relaciones correctamente', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(recetaEncontrada);

            const result = await repository.getRecipeEntityById(recipeId);

            expect(result).toEqual(recetaEncontrada);
            expect(mockRecipeOrmRepository.findOne).toHaveBeenCalledWith({
                where: { id: recipeId },
                relations: ['ingredientes', 'ingredientes.ingrediente'],
            });
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeOrmRepository.findOne.mockResolvedValue(null);

            await expect(repository.getRecipeEntityById(recipeId)).rejects.toThrow(NotFoundException);
        });
    });
});