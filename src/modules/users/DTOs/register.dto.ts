import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez', maxLength: 25 })
  @IsString()
  @MaxLength(25, { message: 'El nombre no puede superar los 25 caracteres' })
  name!: string;

  @ApiProperty({ example: 'juan@mail.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @ApiProperty({ example: 'miPassword123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  password!: string;
}
