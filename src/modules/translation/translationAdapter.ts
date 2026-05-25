import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientTranslation } from './entities/ingredientTranslation.entity';
import { ITranslation } from './translation.interface';

@Injectable()
export class TranslationAdapter implements ITranslation {
    constructor(
        @InjectRepository(IngredientTranslation)
        private translationRepository: Repository<IngredientTranslation>
    ) { }

    async traducir(nombreEspanol: string): Promise<string> {
        const traduccion = await this.translationRepository.findOne({
            where: { nombreEspanol: nombreEspanol.toLowerCase() }
        });

        if (!traduccion) throw new NotFoundException(`No se encontró traducción para: ${nombreEspanol}`);

        return traduccion.nombreIngles;
    }
}