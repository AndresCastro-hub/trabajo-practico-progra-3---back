import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersProvider } from '../../src/modules/users/users.provider';
import { RegisterDto } from '../../src/modules/users/DTOs/register.dto';
import { LoginDto } from '../../src/modules/users/DTOs/login.dto';
import { RoleNames, RoleIds } from '../../src/modules/auth/roles.enum';
import { RegisterResponseDto } from '../../src/modules/users/DTOs/registerResponse.dto';

const mockUser: RegisterResponseDto = {
  name: 'Juan',
  email: 'juan@mail.com',
  rolName: RoleNames[RoleIds.USER],
};

const mockUsersProvider = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersProvider, useValue: mockUsersProvider }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('debería llamar a register y retornar el usuario creado', async () => {
      mockUsersProvider.register.mockResolvedValue(mockUser);

      const dto: RegisterDto = { name: 'Juan', email: 'juan@mail.com', password: 'password123' };
      const result: RegisterResponseDto = await controller.createUser(dto);

      expect(mockUsersProvider.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginUser', () => {
    it('debería llamar a login y retornar el token', async () => {
      mockUsersProvider.login.mockResolvedValue({ accessToken: 'mock.jwt.token' });

      const dto: LoginDto = { email: 'juan@mail.com', password: 'password123' };
      const result: { accessToken: string } = await controller.loginUser(dto);

      expect(mockUsersProvider.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
    });
  });
});