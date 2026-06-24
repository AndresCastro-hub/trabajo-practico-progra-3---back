import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { IngredientModule } from './modules/ingredients/ingredients.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AppSeederService } from './database/seeds/app-seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    IngredientModule,
    RecipesModule,
    CalendarModule,
  ],
  providers: [AppSeederService],
})
export class AppModule {}