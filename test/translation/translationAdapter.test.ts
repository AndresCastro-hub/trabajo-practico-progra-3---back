import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslationAdapter } from '../../src/modules/translation/translationAdapter';
import { IngredientTranslation } from '../../src/modules/translation/entities/ingredientTranslation.entity';

const mockIngredientTranslation = {
  id: 1,
  nombreEspanol: 'queso',
  nombreIngles: 'Cheese',
};

const mockTranslationRepository = {
  findOne: jest.fn(),
};

describe('TranslationAdapter', () => {
  let adapter: TranslationAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationAdapter,
        {
          provide: getRepositoryToken(IngredientTranslation),
          useValue: mockTranslationRepository,
        },
      ],
    }).compile();

    adapter = module.get<TranslationAdapter>(TranslationAdapter);
    jest.clearAllMocks();
  });

  describe('traducir', () => {
    it('debería retornar la traducción en inglés convirtiendo la búsqueda a minúsculas', async () => {
      mockTranslationRepository.findOne.mockResolvedValue(mockIngredientTranslation);
      
      const palabra = 'QueSo'; 

      const result = await adapter.traducir(palabra);

      expect(mockTranslationRepository.findOne).toHaveBeenCalledWith({
        where: { nombreEspanol: 'queso' },
      });
      expect(result).toBe('Cheese');
    });

    it('debería lanzar NotFoundException si no se encuentra la traducción', async () => {
      mockTranslationRepository.findOne.mockResolvedValue(null);
      const palabra = 'ingredienteFalso';

      await expect(adapter.traducir(palabra)).rejects.toThrow(NotFoundException);

      await expect(adapter.traducir(palabra)).rejects.toThrow(`No se encontró traducción para: ${palabra}`);
      
      expect(mockTranslationRepository.findOne).toHaveBeenCalled();
    });
  });
});