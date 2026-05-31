import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './DTOs/createUser.dto';
import { GetUsersDto, UserInfo } from './DTOs/getUsers.dto';
import { userToUserInfo } from './mappers/userToUserInfo.mapper';

export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByName(page: number, name?: string): Promise<GetUsersDto> {
    const pageSize = 20;
    const skip = page * pageSize;

    const totalcount = await this.usersRepository.createQueryBuilder('user')
    .where(name ? 'user.name ILIKE :name' : '1=1', { name: `%${name}%` })
    .getCount();
    
    const users: User[] = await this.usersRepository.createQueryBuilder('user').
    where(name ? 'user.name ILIKE :name' : '1=1', { name: `%${name}%` })
    .skip(skip)
    .take(pageSize)
    .getMany();

    const usersInfo: UserInfo[] = users.map(user => userToUserInfo(user));

    return { users: usersInfo, totalUsers: totalcount, totalPages: Math.ceil(totalcount / pageSize) };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(newUser);
  }
}