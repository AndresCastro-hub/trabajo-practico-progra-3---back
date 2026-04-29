import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterDto } from './DTOs/register.dto';
import { UsersProvider } from './users.provider';
import { LoginDto } from './DTOs/login.dto';
import { RoleGuardDto } from '../auth/dtos/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersProvider: UsersProvider) {}

    @Post('register')
    async createUser(@Body() body: RegisterDto): Promise<User> {
        return await this.usersProvider.register(body);
    }

    @Post('login')
    async loginUser(@Body() user: LoginDto): Promise<string> {
        return await this.usersProvider.login(user);
    }
    //Ruta de prueba para verificar que el guard de roles funciona correctamente. Solo los usuarios con rolId 1 (admin) pueden acceder a esta ruta.
    @Get('meROLE')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(1)
    getMeR(@Request() req: { user: RoleGuardDto }): RoleGuardDto {
        return req.user;
    }
    //Ruta de prueba para verificar que el guard de jwt funciona correctamente. Cualquier usuario autenticado puede acceder a esta ruta.
    @Get('meJWT')
    @UseGuards(JwtAuthGuard)
    getMeJWT(@Request() req: { user: RoleGuardDto }): RoleGuardDto {
        return req.user;
    }
    //Ruta de prueba sin ningún guard para verificar que la autenticación no es necesaria para acceder a esta ruta. Cualquier usuario, autenticado o no, puede acceder a esta ruta.
    @Get('mefree')
    getMefree(@Request() req: { user: RoleGuardDto }): RoleGuardDto {
        return req.user;
    }
}