import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'juan@mail.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @ApiProperty({ example: 'contraseña123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8,{message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72,{message: 'La contraseña no puede tener más de 72 caracteres' })
  password!: string;
}
