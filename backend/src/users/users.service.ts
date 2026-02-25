import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    try {
      const user = this.usersRepository.create(createUserDto);
      await this.usersRepository.save(user);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        return; // email already taken — silently succeed
      }
      throw err;
    }
  }
}
