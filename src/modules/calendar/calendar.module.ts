import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './entities/calendar-entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TipoComida } from './entities/tipo-comida-entity';
import { CalendarWeekService } from './calendar-week.service';

@Module({
    imports: [TypeOrmModule.forFeature([Calendar, Recipe, TipoComida])],
    controllers: [CalendarController],
    providers: [CalendarService, CalendarWeekService]
})
export class CalendarModule {}
