import { RegisterDto } from '../DTOs/register.dto';
import { CreateUserDto } from '../DTOs/createUser.dto';
import { RoleIds } from '../../auth/roles.enum';

export function registerToCreateUserDto(dto: RegisterDto, hashedPassword: string): CreateUserDto {
    return {
        name: dto.name,
        email: dto.email,
        passwordHashed: hashedPassword,
        rolId: RoleIds.USER,
        fechaCreacion: new Date(),
    };
}