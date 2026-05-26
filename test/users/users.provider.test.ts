import { Test, TestingModule } from '@nestjs/testing';
import { UsersProvider } from '../../src/modules/users/users.provider';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../../src/modules/users/entities/user.entity';
import { RoleIds, RoleNames } from '../../src/modules/auth/roles.enum';
import { UserInfo } from '../../src/modules/users/DTOs/getUsers.dto';

const mockUser: User = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  passwordHashed: '',
  rolId: RoleIds.USER,
  fechaCreacion: new Date(),
};

const mockUserInfo: UserInfo = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  rolName: RoleNames[RoleIds.USER],
};

const mockUsersRepository = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  findByName: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('1'),
};

describe('UsersProvider', () => {
  let provider: UsersProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersProvider,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    provider = module.get<UsersProvider>(UsersProvider);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería crear un usuario correctamente', async () => {
      const hashedPassword = await bcrypt.hash('password123', 1);
      const mockUserConHash: User = { ...mockUser, passwordHashed: hashedPassword };
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.createUser.mockResolvedValue(mockUserConHash);
      
      const result = await provider.register({
        name: 'Juan',
        email: 'juan@mail.com',
        password: 'password123',
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('juan@mail.com');
      expect(mockUsersRepository.createUser).toHaveBeenCalled();
      expect(result).toEqual({
        name: 'Juan',
        email: 'juan@mail.com',
        rolName: RoleNames[RoleIds.USER],
      });
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        provider.register({ name: 'Juan', email: 'juan@mail.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debería retornar un accessToken si las credenciales son correctas', async () => {
      mockUser.passwordHashed = await bcrypt.hash('password123', 1);
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await provider.login({ email: 'juan@mail.com', password: 'password123' });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        rol: "usuario",
        name: mockUser.name,
      });
    });

    it('debería lanzar UnauthorizedException si el email no existe', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        provider.login({ email: 'noexiste@mail.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        provider.login({ email: 'juan@mail.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllFilterByName', () => {
    it('debería llamar a findByName del repositorio con los parámetros correctos', async () => {
      const mockGetUsersDto = { users: [mockUserInfo], totalUsers: 1, totalPages: 1 };
      mockUsersRepository.findByName.mockResolvedValue(mockGetUsersDto);
      const page = 1;
      const name = 'Juan';
      const result = await provider.getAllFilterByName(page, name);

      expect(mockUsersRepository.findByName).toHaveBeenCalledWith(page, name);
      expect(result).toEqual(mockGetUsersDto);
    });
  });
  
});