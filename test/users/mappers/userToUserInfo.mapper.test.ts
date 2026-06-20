import { userToUserInfo } from '../../../src/modules/users/mappers/userToUserInfo.mapper';
import { User } from '../../../src/modules/users/entities/user.entity';
import { UserInfo } from '../../../src/modules/users/DTOs/getUsers.dto';
import { RoleIds, RoleNames } from '../../../src/modules/auth/roles.enum';

describe('userToUserInfoMapper: ', () => {
    it('debería mapear correctamente User a UserInfo', () => {
        const mockUser: User = {
            id: 1,
            name: 'Juan',
            email: 'juan@mail.com',
            passwordHashed: 'hashedPassword',
            rolId: RoleIds.USER,
            fechaCreacion: expect.any(Date),
        };

        const expectedUserInfo: UserInfo = {
            id: 1,
            name: 'Juan',
            email: 'juan@mail.com',
            rolName: RoleNames[RoleIds.USER],
        };

        const result = userToUserInfo(mockUser);

        expect(result).toEqual(expectedUserInfo);
    });

});