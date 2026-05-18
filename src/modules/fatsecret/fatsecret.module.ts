import { Module } from '@nestjs/common';
import { FatSecretService } from './fatsecret.service';
import { NUTRITION_SERVICE } from '../nutrition/nutrition.interface';

@Module({
    providers: [
        {
            provide: NUTRITION_SERVICE,
            useClass: FatSecretService,
        }
    ],
    exports: [NUTRITION_SERVICE],
})
export class FatSecretModule {}