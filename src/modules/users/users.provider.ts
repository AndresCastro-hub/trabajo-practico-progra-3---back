import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { JwtPayload } from '../auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './DTOs/login.dto';
import { RegisterDto } from './DTOs/register.dto';
import { registerToCreateUserDto } from './mappers/registerToCreateUser.mapper';
import { userToRegisterResponseDto } from './mappers/userToRegisterResponse.mapper';
import { RegisterResponseDto } from './DTOs/registerResponse.dto';
import { RoleIds, RoleNames } from '../auth/roles.enum';

@Injectable()
export class UsersProvider {
    constructor(
        private usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(newUser: RegisterDto): Promise<RegisterResponseDto> {
        const existing = await this.usersRepository.findByEmail(newUser.email);

        if (existing) {
            throw new ConflictException('El email ya está en uso');
        }

        const saltRounds: number = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
        const hashedPassword: string = await bcrypt.hash(newUser.password, saltRounds);        

        const createdUser: User = await this.usersRepository.createUser(
            registerToCreateUserDto(newUser, hashedPassword)
        );

        const rolName = RoleNames[createdUser.rolId as RoleIds] ?? 'desconocido';
        return userToRegisterResponseDto(createdUser, rolName);
    }

    async login(newLogin: LoginDto): Promise<{accessToken: string}> {
        const user: User | null = await this.usersRepository.findByEmail(newLogin.email);

        if (!user) {
            throw new UnauthorizedException('El email no está registrado');
        }

        const passwordToCompare: string = user.passwordHashed ?? '$2b$10$invalidhashusedastimingprotection';

        const isMatch: boolean = await bcrypt.compare(newLogin.password, passwordToCompare);

        if (!isMatch) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const rolName = RoleNames[user.rolId as RoleIds] ?? 'desconocido';

        const payload: JwtPayload = { id: user.id, email: user.email, rol: rolName, name: user.name };

        const token =  this.jwtService.sign(payload);

        return{
            accessToken: token
        }
    }
}
