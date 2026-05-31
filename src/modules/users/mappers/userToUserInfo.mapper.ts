import { UserInfo } from '../DTOs/getUsers.dto';
import { User } from '../entities/user.entity';
import { RoleIds, RoleNames } from '../../auth/roles.enum';

export function userToUserInfo(user: User): UserInfo {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        rolName: RoleNames[user.rolId as RoleIds],
    };
}