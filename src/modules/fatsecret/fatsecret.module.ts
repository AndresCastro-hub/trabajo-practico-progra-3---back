import { Module } from '@nestjs/common';
import { FatSecretService } from './fatsecret.service';
import { NUTRITION_SERVICE } from '../nutrition/nutrition.interface';
import { TranslationModule } from '../translation/translation.module';

@Module({
    imports: [TranslationModule],
    providers: [
        {
            provide: NUTRITION_SERVICE,
            useClass: FatSecretService,
        }
    ],
    exports: [NUTRITION_SERVICE],
})
export class FatSecretModule {}