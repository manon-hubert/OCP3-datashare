import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/auth/entity/user.entity';
import { FileEntity } from '../src/files/entities/file.entity';
import { StorageService } from '../src/storage/storage.service';
import { ErrorCode, ErrorMessage } from '../src/common/constants/error-codes';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';

const TEST_EMAIL = 'files-test@datashare.test';
const TEST_PASSWORD = 'password123';

// Minimal valid 1×1 PNG — file-type v21 reads beyond the magic bytes into chunk headers
const SMALL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
// Windows EXE magic bytes (MZ header) → file-type detects as application/x-msdownload → not in allowed list
const FORBIDDEN_BYTES = Buffer.concat([Buffer.from([0x4d, 0x5a, 0x90, 0x00]), Buffer.alloc(96)]);
// Valid PNG header so file-type passes, but size exceeds the 1000-byte limit set in beforeAll
const LARGE_FILE = Buffer.concat([SMALL_PNG, Buffer.alloc(1000)]);

describe('Files (integration)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<UserEntity>;
  let filesRepository: Repository<FileEntity>;
  let storageService: StorageService;
  let authToken: string;
  let userId: number;
  let tempUploadDir: string;

  beforeAll(async () => {
    tempUploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'datashare-test-'));
    process.env.UPLOAD_PATH = tempUploadDir;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string, defaultValue?: unknown) => {
          if (key === 'MAX_FILE_SIZE') return 1000;
          const val = process.env[key];
          if (val === undefined) return defaultValue;
          if (key === 'DB_PORT') return Number(val);
          return val;
        },
        getOrThrow: (key: string) => {
          if (key === 'MAX_FILE_SIZE') return 1000;
          const val = process.env[key];
          if (val === undefined) throw new Error(`Config "${key}" is not defined`);
          if (key === 'DB_PORT') return Number(val);
          return val;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    usersRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    filesRepository = moduleFixture.get<Repository<FileEntity>>(getRepositoryToken(FileEntity));
    storageService = moduleFixture.get(StorageService);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    authToken = loginRes.body.access_token as string;

    const user = await usersRepository.findOneBy({ email: TEST_EMAIL });
    userId = user!.id;
  });

  afterAll(async () => {
    await usersRepository.delete({ email: TEST_EMAIL });
    await app.close();
    await fs.rm(tempUploadDir, { recursive: true, force: true });
    delete process.env.UPLOAD_PATH;
  });

  afterEach(async () => {
    await filesRepository.delete({ userId });
  });

  describe('POST /files', () => {
    it('returns 201 with file metadata on a valid authenticated upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body).toMatchObject({
        originalName: 'photo.png',
        mimeType: 'image/png',
        size: SMALL_PNG.length,
        downloadToken: expect.stringMatching(/^[0-9a-f]{64}$/),
        createdAt: expect.any(String),
      });
      expect(typeof res.body.id).toBe('string');
      expect(res.body.userId).toBeUndefined(); // excluded by @Exclude()
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'photo.png' })
        .expect(401);
    });

    it('returns 413 with FILE_TOO_LARGE when the file exceeds the size limit', async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', LARGE_FILE, { filename: 'large.txt' })
        .expect(413);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_TOO_LARGE,
          message: ErrorMessage[ErrorCode.FILE_TOO_LARGE],
        },
      });
    });

    it('returns 415 with FILE_TYPE_FORBIDDEN when the MIME type is not allowed', async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', FORBIDDEN_BYTES, { filename: 'bad.bin' })
        .expect(415);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_TYPE_FORBIDDEN,
          message: ErrorMessage[ErrorCode.FILE_TYPE_FORBIDDEN],
        },
      });
    });
  });

  describe('GET /files/download/:token', () => {
    let downloadToken: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' });
      downloadToken = res.body.downloadToken as string;
    });

    it('returns 200 with file metadata for a valid token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/files/download/${downloadToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        originalName: 'photo.png',
        mimeType: 'image/png',
        size: SMALL_PNG.length,
        createdAt: expect.any(String),
      });
      expect(res.body.userId).toBeUndefined();
      expect(res.body.downloadToken).toBeUndefined();
    });

    it('returns 404 with FILE_NOT_FOUND for an unknown token', async () => {
      const res = await request(app.getHttpServer())
        .get('/files/download/unknown-token-that-does-not-exist')
        .expect(404);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_NOT_FOUND,
          message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
        },
      });
    });
  });

  describe('GET /files/download/:token/content', () => {
    let downloadToken: string;
    let fileId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' });
      downloadToken = res.body.downloadToken as string;
      fileId = res.body.id as string;
    });

    it('returns 200 with correct Content-Type and Content-Disposition headers', async () => {
      const res = await request(app.getHttpServer())
        .get(`/files/download/${downloadToken}/content`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/image\/png/);
      expect(res.headers['content-disposition']).toContain('photo.png');
      expect(parseInt(res.headers['content-length'])).toBe(SMALL_PNG.length);
    });

    it('returns 404 with FILE_NOT_FOUND for an unknown token', async () => {
      const res = await request(app.getHttpServer())
        .get('/files/download/unknown-token/content')
        .expect(404);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_NOT_FOUND,
          message: ErrorMessage[ErrorCode.FILE_NOT_FOUND],
        },
      });
    });

    it('returns 410 with FILE_GONE when the file is deleted from disk but the DB row still exists', async () => {
      await storageService.delete(`users/${userId}/${fileId}`);

      const res = await request(app.getHttpServer())
        .get(`/files/download/${downloadToken}/content`)
        .expect(410);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_GONE,
          message: ErrorMessage[ErrorCode.FILE_GONE],
        },
      });
    });
  });
});
