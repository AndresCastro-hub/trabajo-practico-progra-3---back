import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersProvider } from '../../src/modules/users/users.provider';
import { User } from '../../src/modules/users/entities/user.entity';
import { RegisterDto } from '../../src/modules/users/DTOs/register.dto';
import { LoginDto } from '../../src/modules/users/DTOs/login.dto';
import { Role } from '../../src/modules/auth/roles.enum';

const mockUser: User = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  passwordHashed: 'hashed',
  rolId: Role.USER,
  fechaCreacion: new Date(),
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
      const result = await controller.createUser(dto);

      expect(mockUsersProvider.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginUser', () => {
    it('debería llamar a login y retornar el token', async () => {
      mockUsersProvider.login.mockResolvedValue('mock.jwt.token');

      const dto: LoginDto = { email: 'juan@mail.com', password: 'password123' };
      const result = await controller.loginUser(dto);

      expect(mockUsersProvider.login).toHaveBeenCalledWith(dto);
      expect(result).toBe('mock.jwt.token');
    });
  });
});