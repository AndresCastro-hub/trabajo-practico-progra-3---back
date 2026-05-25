import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientTranslation } from './entities/ingredientTranslation.entity';
import { TranslationAdapter } from './translationAdapter';
import { TRANSLATION_SERVICE } from './translation.interface';

@Module({
    imports: [TypeOrmModule.forFeature([IngredientTranslation])],
    providers: [{
        provide: TRANSLATION_SERVICE,
        useClass: TranslationAdapter
    }],
    exports: [TRANSLATION_SERVICE],
})
export class TranslationModule {}