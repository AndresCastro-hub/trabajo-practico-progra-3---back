import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from '../../src/modules/recipes/recipes.controller';
import { RecipesService } from '../../src/modules/recipes/recipes.service';
import { CreateRecipeDto } from '../../src/modules/recipes/DTOs/createRecipe.dto';
import { editRecipeDto } from '../../src/modules/recipes/DTOs/editRecipe.dto';
import { RecipeResponseDto } from '../../src/modules/recipes/DTOs/recipeResponse.dto';
import { GetRecipeDto } from '../../src/modules/recipes/DTOs/getRecipeDto.dto';
import { GetRecipeIdDto } from '../../src/modules/recipes/DTOs/getRecipeId.dto';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';

const mockRecipesService = {
    create: jest.fn(),
    uploadImage: jest.fn(),
    getterRecipes: jest.fn(),
    getRecipeById: jest.fn(),
    editRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
};

const mockRequest = {
    user: { id: 10, role: "user" },
};

const mockRecipeResponse: RecipeResponseDto = {
    id: 1,
    nombre: "Milanesa Napolitana",
    descripcion: "Clásica milanesa",
    calorias: 500,
    tiempoPreparacion: 30,
    imagen_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    ingredientes: [],
};

describe("RecipesController", () => {
    let controller: RecipesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RecipesController],
            providers: [
                { provide: RecipesService, useValue: mockRecipesService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<RecipesController>(RecipesController);
    });

    afterEach(() => jest.clearAllMocks());

    describe("create", () => {

        const dto: CreateRecipeDto = {
            nombre: "Milanesa Napolitana",
            descripcion: "Clásica milanesa",
            tiempoPreparacion: 30,
            ingredientes: [{ ingrediente_id: 1, cantidad: 200 }],
        };

        it("debería crear una receta correctamente", async () => {
            mockRecipesService.create.mockResolvedValue(mockRecipeResponse);

            const result = await controller.create(dto, mockRequest as any);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipesService.create).toHaveBeenCalledWith(dto, mockRequest.user.id);
        });

        it("debería llamar al service con el id del usuario del request", async () => {
            mockRecipesService.create.mockResolvedValue(mockRecipeResponse);

            await controller.create(dto, mockRequest as any);

            expect(mockRecipesService.create).toHaveBeenCalledWith(dto, 10);
            expect(mockRecipesService.create).toHaveBeenCalledTimes(1);
        });

        it("debería propagar NotFoundException si un ingrediente no existe", async () => {
            mockRecipesService.create.mockRejectedValue(
                new Error("Ingrediente no encontrado")
            );

            await expect(controller.create(dto, mockRequest as any))
                .rejects.toThrow("Ingrediente no encontrado");
        });
    });

    describe("uploadImage", () => {

        const file = { originalname: "foto.png" } as Express.Multer.File;

        it("debería subir la imagen y devolver la receta actualizada", async () => {
            mockRecipesService.uploadImage.mockResolvedValue(mockRecipeResponse);

            const result = await controller.uploadImage(1, file);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipesService.uploadImage).toHaveBeenCalledWith(1, file);
        });

        it("debería llamar al service con el id de la receta y el archivo correctos", async () => {
            mockRecipesService.uploadImage.mockResolvedValue(mockRecipeResponse);

            await controller.uploadImage(1, file);

            expect(mockRecipesService.uploadImage).toHaveBeenCalledWith(1, file);
            expect(mockRecipesService.uploadImage).toHaveBeenCalledTimes(1);
        });

        it("debería propagar BadRequestException si no se envía imagen", async () => {
            mockRecipesService.uploadImage.mockRejectedValue(
                new Error("La imagen es obligatoria")
            );

            await expect(controller.uploadImage(1, undefined as any))
                .rejects.toThrow("La imagen es obligatoria");
        });
    });

    describe("getRecipes", () => {

        const mockResponse: GetRecipeDto = {
            recipeDto: [],
            totalRecords: 0,
            totalPages: 0,
        };

        it("debería devolver el listado paginado de recetas", async () => {
            mockRecipesService.getterRecipes.mockResolvedValue(mockResponse);

            const result = await controller.getRecipes(1, false, "milanesa", mockRequest as any);

            expect(result).toEqual(mockResponse);
            expect(mockRecipesService.getterRecipes).toHaveBeenCalledWith(1, mockRequest.user.id, false, "milanesa");
        });

        it("debería llamar al service con los parámetros correctos", async () => {
            mockRecipesService.getterRecipes.mockResolvedValue(mockResponse);

            await controller.getRecipes(1, true, undefined as any, mockRequest as any);

            expect(mockRecipesService.getterRecipes).toHaveBeenCalledWith(1, 10, true, undefined);
            expect(mockRecipesService.getterRecipes).toHaveBeenCalledTimes(1);
        });

        it("debería devolver un array vacío si no hay recetas", async () => {
            mockRecipesService.getterRecipes.mockResolvedValue({
                recipeDto: [],
                totalRecords: 0,
                totalPages: 0,
            });

            const result = await controller.getRecipes(1, false, "inexistente", mockRequest as any);

            expect(result.recipeDto).toEqual([]);
        });
    });

    describe("getOneRecipeById", () => {

        const mockRecipeId: GetRecipeIdDto = {
            nombre: "Milanesa Napolitana",
            descripcion: "Clásica milanesa",
            calorias: 500,
            tiempoPreparacion: 30,
            imagen_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
            idUsuario: 10,
            ingredientes: [],
        };

        it("debería devolver una receta por su id", async () => {
            mockRecipesService.getRecipeById.mockResolvedValue(mockRecipeId);

            const result = await controller.getOneRecipeById(1);

            expect(result).toEqual(mockRecipeId);
            expect(mockRecipesService.getRecipeById).toHaveBeenCalledWith(1);
        });

        it("debería llamar al service con el id correcto", async () => {
            mockRecipesService.getRecipeById.mockResolvedValue(mockRecipeId);

            await controller.getOneRecipeById(5);

            expect(mockRecipesService.getRecipeById).toHaveBeenCalledWith(5);
            expect(mockRecipesService.getRecipeById).toHaveBeenCalledTimes(1);
        });

        it("debería propagar NotFoundException si la receta no existe", async () => {
            mockRecipesService.getRecipeById.mockRejectedValue(
                new Error("la receta con el id: 99 no existe")
            );

            await expect(controller.getOneRecipeById(99))
                .rejects.toThrow("la receta con el id: 99 no existe");
        });
    });

    describe("patchRecipe", () => {

        const dto: editRecipeDto = { description: "nueva descripcion" };

        it("debería editar una receta correctamente", async () => {
            mockRecipesService.editRecipe.mockResolvedValue(mockRecipeResponse);

            const result = await controller.patchRecipe(dto, 1, mockRequest as any);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipesService.editRecipe).toHaveBeenCalledWith(dto, 1, mockRequest.user.id);
        });

        it("debería llamar al service con el dto, el id de receta y el id de usuario correctos", async () => {
            mockRecipesService.editRecipe.mockResolvedValue(mockRecipeResponse);

            await controller.patchRecipe(dto, 1, mockRequest as any);

            expect(mockRecipesService.editRecipe).toHaveBeenCalledWith(dto, 1, 10);
            expect(mockRecipesService.editRecipe).toHaveBeenCalledTimes(1);
        });

        it("debería propagar BadRequestException si la receta no pertenece al usuario", async () => {
            mockRecipesService.editRecipe.mockRejectedValue(
                new Error("La receta con id: 1 no pertenece al usuario con id: 10")
            );

            await expect(controller.patchRecipe(dto, 1, mockRequest as any))
                .rejects.toThrow("La receta con id: 1 no pertenece al usuario con id: 10");
        });

        it("debería propagar NotFoundException si la receta no existe", async () => {
            mockRecipesService.editRecipe.mockRejectedValue(
                new Error("la receta con el id: 1 no existe")
            );

            await expect(controller.patchRecipe(dto, 1, mockRequest as any))
                .rejects.toThrow("la receta con el id: 1 no existe");
        });
    });

    describe("deleteRecipe", () => {

        it("debería eliminar una receta correctamente", async () => {
            mockRecipesService.deleteRecipe.mockResolvedValue(mockRecipeResponse);

            const result = await controller.deleteRecipe(1, mockRequest as any);

            expect(result).toEqual(mockRecipeResponse);
            expect(mockRecipesService.deleteRecipe).toHaveBeenCalledWith(1, mockRequest.user.id);
        });

        it("debería llamar al service con el id de receta y el id de usuario correctos", async () => {
            mockRecipesService.deleteRecipe.mockResolvedValue(mockRecipeResponse);

            await controller.deleteRecipe(1, mockRequest as any);

            expect(mockRecipesService.deleteRecipe).toHaveBeenCalledWith(1, 10);
            expect(mockRecipesService.deleteRecipe).toHaveBeenCalledTimes(1);
        });

        it("debería propagar BadRequestException si la receta no pertenece al usuario", async () => {
            mockRecipesService.deleteRecipe.mockRejectedValue(
                new Error("La receta con id: 1 no pertenece al usuario con id: 10")
            );

            await expect(controller.deleteRecipe(1, mockRequest as any))
                .rejects.toThrow("La receta con id: 1 no pertenece al usuario con id: 10");
        });
    });
});