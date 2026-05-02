import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Role } from '../../src/modules/auth/roles.enum';

const mockUser: User = {
  id: 1,
  name: 'Juan',
  email: 'juan@mail.com',
  passwordHashed: 'hashed',
  rolId: Role.USER,
  fechaCreacion: new Date(),
};

const mockTypeOrmRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: getRepositoryToken(User), useValue: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
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
      rolId: Role.USER,
      fechaCreacion: new Date(),
    };

    const result = await repository.createUser(dto);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });
});