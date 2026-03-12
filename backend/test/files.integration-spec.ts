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
import { FileHistoryEntity } from '../src/files/entities/file-history.entity';
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
  let fileHistoryRepository: Repository<FileHistoryEntity>;
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
    fileHistoryRepository = moduleFixture.get<Repository<FileHistoryEntity>>(
      getRepositoryToken(FileHistoryEntity),
    );
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
    await fileHistoryRepository.delete({ userId });
    await filesRepository.createQueryBuilder().delete().where('userId IS NULL').execute();
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

    it('returns 201 with file metadata when no auth token is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body).toMatchObject({
        originalName: 'photo.png',
        mimeType: 'image/png',
        size: SMALL_PNG.length,
        downloadToken: expect.stringMatching(/^[0-9a-f]{64}$/),
        createdAt: expect.any(String),
      });
      expect(res.body.userId).toBeUndefined();
    });

    it('stores an anonymous file at anonymous/{fileId} on disk', async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' });
      const fileId = res.body.id as string;

      await expect(storageService.read(`anonymous/${fileId}`)).resolves.toEqual(SMALL_PNG);
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

    it('returns 200 with metadata for a token from an anonymous upload', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'anon.png', contentType: 'image/png' });
      const anonToken = uploadRes.body.downloadToken as string;

      const res = await request(app.getHttpServer())
        .get(`/files/download/${anonToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        originalName: 'anon.png',
        mimeType: 'image/png',
        size: SMALL_PNG.length,
        createdAt: expect.any(String),
      });
      expect(res.body.userId).toBeUndefined();
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

    it('returns 200 with correct headers and body for an anonymous upload', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'anon.png', contentType: 'image/png' });
      const anonToken = uploadRes.body.downloadToken as string;

      const res = await request(app.getHttpServer())
        .get(`/files/download/${anonToken}/content`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/image\/png/);
      expect(res.headers['content-disposition']).toContain('anon.png');
      expect(parseInt(res.headers['content-length'])).toBe(SMALL_PNG.length);
    });

    it('returns 410 with FILE_GONE when an anonymous file is deleted from disk', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files')
        .attach('file', SMALL_PNG, { filename: 'anon.png', contentType: 'image/png' });
      const anonToken = uploadRes.body.downloadToken as string;
      const anonFileId = uploadRes.body.id as string;

      await storageService.delete(`anonymous/${anonFileId}`);

      const res = await request(app.getHttpServer())
        .get(`/files/download/${anonToken}/content`)
        .expect(410);

      expect(res.body).toEqual({
        error: {
          code: ErrorCode.FILE_GONE,
          message: ErrorMessage[ErrorCode.FILE_GONE],
        },
      });
    });
  });

  describe('DELETE /files/:id', () => {
    let fileId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' });
      fileId = res.body.id as string;
    });

    it('returns 204 on success', async () => {
      await request(app.getHttpServer())
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('removes the file from the files table', async () => {
      await request(app.getHttpServer())
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const found = await filesRepository.findOneBy({ id: fileId });
      expect(found).toBeNull();
    });

    it('removes the file from storage', async () => {
      await request(app.getHttpServer())
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`);

      await expect(storageService.read(`users/${userId}/${fileId}`)).rejects.toMatchObject({
        code: 'ENOENT',
      });
    });

    it('creates a file_history record with the correct fields', async () => {
      await request(app.getHttpServer())
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const history = await fileHistoryRepository.findOneBy({ userId });
      expect(history).toMatchObject({
        userId,
        originalName: 'photo.png',
        mimeType: 'image/png',
      });
      expect(history!.deletedAt).toBeInstanceOf(Date);
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).delete(`/files/${fileId}`).expect(401);
    });

    it('returns 403 when the file belongs to another user', async () => {
      const otherEmail = 'other-delete@datashare.test';
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const otherToken = loginRes.body.access_token as string;

      await request(app.getHttpServer())
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await usersRepository.delete({ email: otherEmail });
    });

    it('returns 404 when the file does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/files/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /files/history', () => {
    it('returns 200 with empty data when the user has no history', async () => {
      const res = await request(app.getHttpServer())
        .get('/files/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('returns the history entry after a file is deleted', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', SMALL_PNG, { filename: 'photo.png', contentType: 'image/png' });
      const id = uploadRes.body.id as string;

      await request(app.getHttpServer())
        .delete(`/files/${id}`)
        .set('Authorization', `Bearer ${authToken}`);

      const res = await request(app.getHttpServer())
        .get('/files/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({
        originalName: 'photo.png',
        mimeType: 'image/png',
        deletedAt: expect.any(String),
      });
      expect(res.body.data[0].userId).toBeUndefined();
    });

    it('returns entries ordered by deletedAt DESC', async () => {
      for (const name of ['first.png', 'second.png']) {
        const uploadRes = await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', SMALL_PNG, { filename: name, contentType: 'image/png' });
        await request(app.getHttpServer())
          .delete(`/files/${uploadRes.body.id as string}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      const res = await request(app.getHttpServer())
        .get('/files/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data[0].originalName).toBe('second.png');
      expect(res.body.data[1].originalName).toBe('first.png');
    });

    it('paginates history correctly', async () => {
      for (const name of ['a.png', 'b.png', 'c.png']) {
        const uploadRes = await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', SMALL_PNG, { filename: name, contentType: 'image/png' });
        await request(app.getHttpServer())
          .delete(`/files/${uploadRes.body.id as string}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      const res = await request(app.getHttpServer())
        .get('/files/history?page=2&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.total).toBe(3);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(2);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 when page is less than 1', async () => {
      await request(app.getHttpServer())
        .get('/files/history?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/files/history').expect(401);
    });

    it('does not return another user history', async () => {
      const otherEmail = 'other-history@datashare.test';
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const otherLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const otherToken = otherLogin.body.access_token as string;

      const uploadRes = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('file', SMALL_PNG, { filename: 'other.png', contentType: 'image/png' });
      await request(app.getHttpServer())
        .delete(`/files/${uploadRes.body.id as string}`)
        .set('Authorization', `Bearer ${otherToken}`);

      const res = await request(app.getHttpServer())
        .get('/files/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toEqual([]);

      const otherUser = await usersRepository.findOneBy({ email: otherEmail });
      await fileHistoryRepository.delete({ userId: otherUser!.id });
      await usersRepository.delete({ email: otherEmail });
    });
  });

  describe('GET /files', () => {
    it('returns 200 with empty data when the user has no files', async () => {
      const res = await request(app.getHttpServer())
        .get('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('paginates file list correctly', async () => {
      for (const name of ['a.png', 'b.png', 'c.png']) {
        await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', SMALL_PNG, { filename: name, contentType: 'image/png' });
      }

      const res = await request(app.getHttpServer())
        .get('/files?page=2&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.total).toBe(3);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(2);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 when page is less than 1', async () => {
      await request(app.getHttpServer())
        .get('/files?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('does not return another user files', async () => {
      const otherEmail = 'other-list@datashare.test';
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const otherLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: otherEmail, password: TEST_PASSWORD });
      const otherToken = otherLogin.body.access_token as string;

      await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('file', SMALL_PNG, { filename: 'other.png', contentType: 'image/png' });

      const res = await request(app.getHttpServer())
        .get('/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toEqual([]);

      const otherUser = await usersRepository.findOneBy({ email: otherEmail });
      await filesRepository.delete({ userId: otherUser!.id });
      await usersRepository.delete({ email: otherEmail });
    });
  });
});
