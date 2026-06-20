import { userToRegisterResponseDto } from '../../../src/modules/users/mappers/userToRegisterResponse.mapper';
import { User } from '../../../src/modules/users/entities/user.entity';
import { RegisterResponseDto } from '../../../src/modules/users/DTOs/registerResponse.dto';
import { RoleIds, RoleNames } from '../../../src/modules/auth/roles.enum';

describe('userToRegisterResponseMapper: ', () => {
    it('debería mapear correctamente User a RegisterResponseDto', () => {
        const mockUser: User = {
            id: 1,
            name: 'Juan',
            email: 'juan@mail.com',
            passwordHashed: 'hashedPassword',
            rolId: RoleIds.USER,
            fechaCreacion: expect.any(Date),
        };

        const expectedRegisterResponseDto: RegisterResponseDto = {
            name: 'Juan',
            email: 'juan@mail.com',
            rolName: RoleNames[RoleIds.USER],
        };

        const result = userToRegisterResponseDto(mockUser, 'usuario');

        expect(result).toEqual(expectedRegisterResponseDto);
    });

});