import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserEntity } from './entity/user.entity';
import { ErrorCode, ErrorMessage } from '../common/constants/error-codes';

const PG_UNIQUE_VIOLATION = '23505';
const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOneBy({ email: loginUserDto.email });

    // Always perform password comparison to mitigate timing attacks, even if user doesn't exist
    const passwordMatch = await bcrypt.compare(loginUserDto.password, user?.password ?? DUMMY_HASH);

    if (!user || !passwordMatch) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: ErrorMessage[ErrorCode.AUTH_INVALID_CREDENTIALS],
      });
    }

    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { access_token };
  }
}
