import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { RoleIds } from '../../src/modules/auth/roles.enum';
import { GetUsersDto, UserInfo } from '../../src/modules/users/DTOs/getUsers.dto';
import { userToUserInfo } from '../../src/modules/users/mappers/userToUserInfo.mapper';

jest.mock('../../src/modules/users/mappers/userToUserInfo.mapper', () => ({
  userToUserInfo: jest.fn(),
}));

const mockUser: User = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  passwordHashed: 'hashed',
  rolId: RoleIds.USER,
  fechaCreacion: expect.any(Date),
};

const mockUserInfo: UserInfo = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  rolName: 'Usuario',
};

const mockTypeOrmRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: getRepositoryToken(User), useValue: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    };

    mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    jest.clearAllMocks();
  });

  it('findByName debería retornar GetUsersDto correctamente cuando NO se pasa un nombre (solo página)', async () => {
    const page = 0;
    const mockUsers: User[] = [
      { ...mockUser, id: 1, name: 'Juan1' },
      { ...mockUser, id: 2, name: 'Juan2' },
      { ...mockUser, id: 3, name: 'Pedro' },
    ];

    mockQueryBuilder.getMany.mockResolvedValue(mockUsers);
    mockQueryBuilder.getCount.mockResolvedValue(3);

    (userToUserInfo as jest.Mock).mockReturnValue(mockUserInfo);

    const result = await repository.findByName(page);

    expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('1=1', { name: `%undefined%` });
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);

    expect(userToUserInfo).toHaveBeenCalledTimes(3);
    expect(userToUserInfo).toHaveBeenCalledWith({ ...mockUser, id: 1, name: 'Juan1' });

    const expectedDto: GetUsersDto = {
      users: [mockUserInfo, mockUserInfo, mockUserInfo],
      totalUsers: 3,
      totalPages: 1,
    };
    
    expect(result).toEqual(expectedDto);
  });

  it('debería aplicar el filtro ILIKE y retornar GetUsersDto cuando SÍ se pasa un nombre', async () => {
      const page = 1;
      const searchName = 'Juan';
      const mockUsers = [mockUser];
      
      mockQueryBuilder.getMany.mockResolvedValue(mockUsers);
      mockQueryBuilder.getCount.mockResolvedValue(21);
      
      (userToUserInfo as jest.Mock).mockReturnValue(mockUserInfo);

      const result = await repository.findByName(page, searchName);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.name ILIKE :name', { name: `%Juan%` });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);

      const expectedDto: GetUsersDto = {
        users: [mockUserInfo],
        totalUsers: 21,
        totalPages: 2,
      };
      
      expect(result).toEqual(expectedDto);
    });

  it('findByEmail debería retornar un usuario por email', async () => {
    mockTypeOrmRepository.findOneBy.mockResolvedValue(mockUser);
    const result = await repository.findByEmail('juan@mail.com');
    expect(result).toEqual(mockUser);
    expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ email: 'juan@mail.com' });
  });

  it('createUser debería crear y guardar un usuario', async () => {
    mockTypeOrmRepository.create.mockReturnValue(mockUser);
    mockTypeOrmRepository.save.mockResolvedValue(mockUser);

    const dto = {
      name: 'Juan',
      email: 'juan@mail.com',
      passwordHashed: 'hashed',
      rolId: RoleIds.USER,
      fechaCreacion: expect.any(Date),
    };

    const result = await repository.createUser(dto);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });
});