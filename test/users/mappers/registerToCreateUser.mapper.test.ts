import { registerToCreateUserDto } from '../../../src/modules/users/mappers/registerToCreateUser.mapper';
import { RegisterDto } from '../../../src/modules/users/DTOs/register.dto';
import { CreateUserDto } from '../../../src/modules/users/DTOs/createUser.dto';
import { RoleIds } from '../../../src/modules/auth/roles.enum';

describe('registerToCreateUserMapper: ', () => {
    it('debería mapear correctamente RegisterDto a CreateUserDto', () => {
        const registerDto: RegisterDto = {
            name: 'Juan',
            email: 'juan@mail.com',
            password: 'contraseña1234',
        };

        const expectedCreateUserDto: CreateUserDto = {
            name: 'Juan',
            email: 'juan@mail.com',
            passwordHashed: 'hashedPassword',
            rolId: RoleIds.USER,
            fechaCreacion: expect.any(Date)
        };

        const result = registerToCreateUserDto(registerDto, 'hashedPassword');

        expect(result).toEqual(expectedCreateUserDto);
    });

});