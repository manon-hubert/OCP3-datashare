jest.mock('bcrypt');

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service';
import { UserEntity } from './entity/user.entity';

const mockBcryptCompare = jest.mocked(bcrypt.compare);

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: { findOneBy: jest.Mock; create: jest.Mock; save: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersRepository = {
      findOneBy: jest.fn(),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn(),
    };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: usersRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('silently returns on duplicate email (PG unique violation)', async () => {
    const pgError = new QueryFailedError('', [], new Error('unique violation'));
    (pgError as unknown as { code: string }).code = '23505';
    usersRepository.save.mockRejectedValue(pgError);

    await expect(
      service.create({ email: 'user@test.com', password: 'password123' }),
    ).resolves.toBeUndefined();
  });

  it('re-throws non-unique QueryFailedErrors from create', async () => {
    const pgError = new QueryFailedError('', [], new Error('connection error'));
    (pgError as unknown as { code: string }).code = '08006';
    usersRepository.save.mockRejectedValue(pgError);

    await expect(
      service.create({ email: 'user@test.com', password: 'password123' }),
    ).rejects.toThrow(pgError);
  });

  it('returns access_token with correct JWT payload on valid credentials', async () => {
    const user = { id: 1, email: 'user@test.com', password: '$2b$10$hashedpassword' };
    usersRepository.findOneBy.mockResolvedValue(user);
    mockBcryptCompare.mockResolvedValue(true as never);
    jwtService.sign.mockReturnValue('mock-token');

    const result = await service.login({ email: user.email, password: 'password123' });

    expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    expect(result).toEqual({ access_token: 'mock-token' });
  });

  it('calls bcrypt.compare against DUMMY_HASH when user does not exist (timing-attack mitigation)', async () => {
    usersRepository.findOneBy.mockResolvedValue(null);
    mockBcryptCompare.mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'unknown@test.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
    const [, hashArg] = mockBcryptCompare.mock.calls[0] as unknown as [string, string];
    expect(hashArg).toMatch(/^\$2b\$/);
  });
});
