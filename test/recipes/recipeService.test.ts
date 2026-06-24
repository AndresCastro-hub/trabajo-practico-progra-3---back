import { Test, TestingModule } from "@nestjs/testing";
import { RecipesService } from "../../src/modules/recipes/recipes.service";
import { RecipeRepository } from "../../src/modules/recipes/repositories/recipe.repository";
import { RecipeIngredientRepository } from "../../src/modules/recipes/repositories/recipe-ingredient.repository";
import { NUTRITION_SERVICE } from "../../src/modules/nutrition/nutrition.interface";
import { STORAGE_SERVICE } from "../../src/modules/cloudinary/cloudinary.interface";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateRecipeDto } from "../../src/modules/recipes/DTOs/createRecipe.dto";
import { IngredientDto } from "../../src/modules/recipes/DTOs/ingredient.dto";
import { RecipeResponseDto } from "../../src/modules/recipes/DTOs/recipeResponse.dto";
import { editRecipeDto } from "../../src/modules/recipes/DTOs/editRecipe.dto";
import { GetRecipeIdDto } from "../../src/modules/recipes/DTOs/getRecipeId.dto";

const mockRecipeRepository = {
    save: jest.fn(),
    findWithRelations: jest.fn(),
    updateImageUrl: jest.fn(),
    getRecipes: jest.fn(),
    getRecipeById: jest.fn(),
    validateUser: jest.fn(),
    edit: jest.fn(),
    deleteRecipe: jest.fn(),
    getRecipeEntityById: jest.fn(),
    updateRecipeCalories: jest.fn(),
};

const mockRecipeIngredientRepository = {
    validateIngredients: jest.fn(),
    saveAll: jest.fn(),
    deleteRecipeIngredients: jest.fn(),
    addRecipeIngredients: jest.fn(),
    updateIngredients: jest.fn(),
    deleteIngredients: jest.fn(),
};

const mockNutritionService = {
    getCaloriasPorIngrediente: jest.fn(),
};

const mockStorageService = {
    uploadImage: jest.fn(),
};

describe('Recipes service', () => {
    let service: RecipesService;

    const ingredientResponseDto = [
        {
            id: 1,
            cantidad: 1,
            ingrediente: {
                id: 1,
                nombre: 'string',
                unidad: 'string',
            }
        }
    ];
    const mockRecipeResponse: RecipeResponseDto = {
        id: 1,
        nombre: 'string',
        descripcion: 'string',
        calorias: 1,
        tiempoPreparacion: 1,
        imagen_url: 'string',
        ingredientes: ingredientResponseDto
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipesService,
                { provide: RecipeRepository, useValue: mockRecipeRepository },
                { provide: RecipeIngredientRepository, useValue: mockRecipeIngredientRepository },
                { provide: NUTRITION_SERVICE, useValue: mockNutritionService },
                { provide: STORAGE_SERVICE, useValue: mockStorageService },
            ],
        }).compile();

        service = module.get<RecipesService>(RecipesService);
    });

    afterEach(() => jest.clearAllMocks());

    describe('create', () => {
        const ingredientesDto: IngredientDto[] = [
            { ingrediente_id: 1, cantidad: 1 }
        ];
        const dto: CreateRecipeDto = {
            nombre: 'alejo',
            descripcion: 'asdasd',
            tiempoPreparacion: 1,
            ingredientes: ingredientesDto
        };
        const userId = 2;

        const ingredientesValidados = [
            { ingrediente: { id: 1, nombre: 'harina', unidad: 'g' }, cantidad: 1 }
        ];
        const recetaGuardada = { id: 1 };

        it('deberia crear una receta correctamente', async () => {
            mockRecipeIngredientRepository.validateIngredients.mockResolvedValue(ingredientesValidados);
            mockNutritionService.getCaloriasPorIngrediente.mockResolvedValue(100);
            mockRecipeRepository.save.mockResolvedValue(recetaGuardada);
            mockRecipeIngredientRepository.saveAll.mockResolvedValue(undefined);
            mockRecipeRepository.findWithRelations.mockResolvedValue(mockRecipeResponse);

            const result = await service.create(dto, userId);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipeIngredientRepository.validateIngredients).toHaveBeenCalledWith(dto.ingredientes);
            expect(mockNutritionService.getCaloriasPorIngrediente).toHaveBeenCalledWith('harina', 1, 'g');
            expect(mockRecipeRepository.save).toHaveBeenCalledWith(dto, userId, 100);
            expect(mockRecipeIngredientRepository.saveAll).toHaveBeenCalledWith(recetaGuardada, ingredientesValidados);
            expect(mockRecipeRepository.findWithRelations).toHaveBeenCalledWith(recetaGuardada.id);
        });

        it('deberia tirar NotFoundException si no encuentra un ingrediente', async () => {
            mockRecipeIngredientRepository.validateIngredients.mockRejectedValue(
                new NotFoundException('Ingrediente no encontrado')
            );

            await expect(service.create(dto, userId)).rejects.toThrow(NotFoundException);
            expect(mockRecipeRepository.save).not.toHaveBeenCalled();
        });

        it('deberia propagar el error si falla el guardado de la receta', async () => {
            mockRecipeIngredientRepository.validateIngredients.mockResolvedValue(ingredientesValidados);
            mockNutritionService.getCaloriasPorIngrediente.mockResolvedValue(100);
            mockRecipeRepository.save.mockRejectedValue(new BadRequestException('Datos inválidos'));

            await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
            expect(mockRecipeIngredientRepository.saveAll).not.toHaveBeenCalled();
        });
    });

    describe('uploadImage', () => {
        const id = 1;
        const mockFile = {
            fieldname: 'file',
            originalname: 'receta-foto.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('fake-image-bytes'),
            size: 12345,
            destination: '',
            filename: '',
            path: '',
            stream: null as any
        } as Express.Multer.File;

        it('deberia subir la imagen y actualizar la receta correctamente', async () => {
            mockStorageService.uploadImage.mockResolvedValue('http://image-url.com/foto.jpg');
            mockRecipeRepository.updateImageUrl.mockResolvedValue(undefined);
            mockRecipeRepository.findWithRelations.mockResolvedValue(mockRecipeResponse);

            const result = await service.uploadImage(id, mockFile);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockStorageService.uploadImage).toHaveBeenCalledWith(mockFile);
            expect(mockRecipeRepository.updateImageUrl).toHaveBeenCalledWith(id, 'http://image-url.com/foto.jpg');
            expect(mockRecipeRepository.findWithRelations).toHaveBeenCalledWith(id);
        });

        it('deberia tirar BadRequestException si no se envia una imagen', async () => {
            await expect(service.uploadImage(id, null as any)).rejects.toThrow(BadRequestException);
            expect(mockStorageService.uploadImage).not.toHaveBeenCalled();
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockStorageService.uploadImage.mockResolvedValue('http://image-url.com/foto.jpg');
            mockRecipeRepository.updateImageUrl.mockRejectedValue(
                new NotFoundException('Receta no encontrada')
            );

            await expect(service.uploadImage(id, mockFile)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getterRecipes', () => {
        const page = 1;
        const userId = 2;

        const recipeResponseRepo = {
            recipe: [
                {
                    id: 1,
                    nombre: '',
                    calorias: 2,
                    tiempoPreparacion: 1,
                    imagen_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
                }
            ],
            totalCount: 1
        };

        beforeEach(() => {
            process.env.RECIPES_PER_PAGE = '6';
        });

        it('deberia devolver la lista de recetas correctamente', async () => {
            const recetasPlataforma = true;
            const name = '';
            mockRecipeRepository.getRecipes.mockResolvedValue(recipeResponseRepo);

            const result = await service.getterRecipes(page, userId, recetasPlataforma, name);

            expect(result.totalRecords).toBe(1);
            expect(result.totalPages).toBe(1);
            expect(result.recipeDto).toHaveLength(1);
            expect(mockRecipeRepository.getRecipes).toHaveBeenCalledWith(page, userId, recetasPlataforma, name);
        });

        it('deberia tirar NotFoundException si no hay registros de recetas', async () => {
            const recetasPlataforma = true;
            const name = '';
            mockRecipeRepository.getRecipes.mockRejectedValue(
                new NotFoundException('No hay registros de recetas disponibles')
            );

            await expect(service.getterRecipes(page, userId, recetasPlataforma, name)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getRecipeById', () => {
        const recipeId = 1;
        const mockGetRecipeIdDto: GetRecipeIdDto = {
            nombre: 'Milanesa',
            descripcion: 'Con fritas',
            calorias: 500,
            tiempoPreparacion: 30,
            imagen_url: 'http://example.com/mila.jpg',
            idUsuario: 2,
            ingredientes: []
        };

        it('deberia retornar una receta por su ID correctamente', async () => {
            mockRecipeRepository.getRecipeById.mockResolvedValue(mockGetRecipeIdDto);

            const result = await service.getRecipeById(recipeId);

            expect(result).toEqual(mockGetRecipeIdDto);
            expect(mockRecipeRepository.getRecipeById).toHaveBeenCalledWith(recipeId);
        });

        it('deberia tirar NotFoundException si la receta no existe', async () => {
            mockRecipeRepository.getRecipeById.mockRejectedValue(
                new NotFoundException('La receta con el ID proporcionado no existe.')
            );

            await expect(service.getRecipeById(recipeId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('editRecipe', () => {
        const recipeId = 1;
        const userId = 2;

        const dto: editRecipeDto = {
            description: 'Clásica milanesa con salsa, jamon y queso',
            prepTime: 30,
            deletedIngredientsId: [1, 2],
            addedIngredients: [
                { ingrediente_id: 3, cantidad: 2 }
            ],
            updatedIngredients: [
                { ingrediente_id: 4, cantidad: 5 }
            ]
        };

        const recipeEntity = {
            id: recipeId,
            ingredientes: [
                { ingrediente: { id: 4, nombre: 'queso', unidad: 'g' }, cantidad: 5 }
            ]
        };

        it('deberia editar una receta correctamente', async () => {
            mockRecipeRepository.validateUser.mockResolvedValue(undefined);
            mockRecipeRepository.edit.mockResolvedValue(undefined);
            mockRecipeIngredientRepository.deleteRecipeIngredients.mockResolvedValue(undefined);
            mockRecipeIngredientRepository.addRecipeIngredients.mockResolvedValue(undefined);
            mockRecipeIngredientRepository.updateIngredients.mockResolvedValue(undefined);
            mockRecipeRepository.getRecipeEntityById.mockResolvedValue(recipeEntity);
            mockNutritionService.getCaloriasPorIngrediente.mockResolvedValue(200);
            mockRecipeRepository.updateRecipeCalories.mockResolvedValue(undefined);
            mockRecipeRepository.findWithRelations.mockResolvedValue(mockRecipeResponse);

            const result = await service.editRecipe(dto, recipeId, userId);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipeRepository.validateUser).toHaveBeenCalledWith(recipeId, userId);
            expect(mockRecipeRepository.edit).toHaveBeenCalledWith(dto, recipeId);
            expect(mockRecipeIngredientRepository.deleteRecipeIngredients).toHaveBeenCalledWith(dto, recipeId);
            expect(mockRecipeIngredientRepository.addRecipeIngredients).toHaveBeenCalledWith(dto, recipeId);
            expect(mockRecipeIngredientRepository.updateIngredients).toHaveBeenCalledWith(dto, recipeId);
            expect(mockRecipeRepository.getRecipeEntityById).toHaveBeenCalledWith(recipeId);
            expect(mockRecipeRepository.updateRecipeCalories).toHaveBeenCalledWith(200, recipeEntity);
            expect(mockRecipeRepository.findWithRelations).toHaveBeenCalledWith(recipeId);
        });

        it('deberia tirar BadRequestException si la receta no pertenece al usuario', async () => {
            mockRecipeRepository.validateUser.mockRejectedValue(
                new BadRequestException('La receta no pertenece al usuario')
            );

            await expect(service.editRecipe(dto, recipeId, userId)).rejects.toThrow(BadRequestException);
            expect(mockRecipeRepository.edit).not.toHaveBeenCalled();
        });

        it('deberia tirar NotFoundException si no encuentra la receta', async () => {
            mockRecipeRepository.validateUser.mockRejectedValue(
                new NotFoundException('La receta con el ID proporcionado no existe.')
            );

            await expect(service.editRecipe(dto, recipeId, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteRecipe', () => {
        const recipeId = 1;
        const userId = 2;

        it('deberia eliminar una receta correctamente', async () => {
            mockRecipeRepository.validateUser.mockResolvedValue(undefined);
            mockRecipeIngredientRepository.deleteIngredients.mockResolvedValue(undefined);
            mockRecipeRepository.deleteRecipe.mockResolvedValue(mockRecipeResponse);

            const result = await service.deleteRecipe(recipeId, userId);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipeRepository.validateUser).toHaveBeenCalledWith(recipeId, userId);
            expect(mockRecipeIngredientRepository.deleteIngredients).toHaveBeenCalledWith(recipeId);
            expect(mockRecipeRepository.deleteRecipe).toHaveBeenCalledWith(recipeId);
        });

        it('deberia tirar BadRequestException si la receta no pertenece al usuario', async () => {
            mockRecipeRepository.validateUser.mockRejectedValue(
                new BadRequestException('La receta no pertenece al usuario')
            );

            await expect(service.deleteRecipe(recipeId, userId)).rejects.toThrow(BadRequestException);
            expect(mockRecipeIngredientRepository.deleteIngredients).not.toHaveBeenCalled();
        });

        it('deberia tirar NotFoundException al intentar borrar una receta inexistente', async () => {
            mockRecipeRepository.validateUser.mockRejectedValue(
                new NotFoundException('La receta con el ID proporcionado no existe.')
            );

            await expect(service.deleteRecipe(recipeId, userId)).rejects.toThrow(NotFoundException);
        });
    });
});