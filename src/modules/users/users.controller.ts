import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { RegisterDto } from './DTOs/register.dto';
import { UsersProvider } from './users.provider';
import { LoginDto } from './DTOs/login.dto';
import { RoleGuardDto } from '../auth/dtos/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterResponseDto } from './DTOs/registerResponse.dto';
import { GetUsersDto } from './DTOs/getUsers.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersProvider: UsersProvider) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar usuario', description: 'Crea un nuevo usuario con rol de usuario común' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Usuario creado correctamente', type: RegisterResponseDto })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 409, description: 'El email ya está en uso' })
    async createUser(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
        return await this.usersProvider.register(body);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica al usuario y retorna un JWT' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login exitoso', schema: { example: { accessToken: 'eyJhbGci...' } } })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    async loginUser(@Body() user: LoginDto): Promise<{accessToken:string}> {
        return await this.usersProvider.login(user);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('administrador')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obtener usuarios', description: 'Devuelve una lista de usuarios de maneras paginada' })
    getAllFilterByName(
        @Query('page')page: number,
        @Query('nombre')name: string
    ): Promise<GetUsersDto> {
        return this.usersProvider.getAllFilterByName(page, name);
    }

    //Ruta de prueba para verificar que el guard de roles funciona correctamente. Solo los usuarios con rol 'administrador' pueden acceder a esta ruta.
    @Get('meROLE')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('administrador')
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
