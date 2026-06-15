import { RegisterResponseDto } from '../DTOs/registerResponse.dto';
import { User } from '../entities/user.entity';

export function userToRegisterResponseDto(user: User, rolName: string): RegisterResponseDto {
    return {
        name: user.name,
        email: user.email,
        rolName: rolName,
    };
}