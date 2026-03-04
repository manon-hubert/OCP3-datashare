import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/auth/entity/user.entity';
import { ErrorCode, ErrorMessage } from '../src/common/constants/error-codes';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';

const TEST_EMAIL = 'auth-test@datashare.test';
const TEST_PASSWORD = 'password123';

describe('Auth (integration)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    usersRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await usersRepository.delete({ email: TEST_EMAIL });
  });

  describe('POST /auth/register', () => {
    it('returns 201 on valid input', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(201);
    });

    it('returns 201 on duplicate email (does not leak account existence)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: TEST_EMAIL, password: 'differentpassword' })
        .expect(201);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    });

    it('returns 200 with access_token on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      expect(typeof res.body.access_token).toBe('string');
    });

    it('returns 401 with AUTH_INVALID_CREDENTIALS on wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongpassword' })
        .expect(401);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: ErrorMessage[ErrorCode.AUTH_INVALID_CREDENTIALS],
        },
      });
    });

    it('returns 401 with AUTH_INVALID_CREDENTIALS on unknown email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown@datashare.test', password: TEST_PASSWORD })
        .expect(401);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: ErrorMessage[ErrorCode.AUTH_INVALID_CREDENTIALS],
        },
      });
    });
  });
});
