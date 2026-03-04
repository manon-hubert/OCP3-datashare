import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileSizePipe } from './file-size.pipe';
import { ErrorCode } from '../constants/error-codes';

const MAX = 1000;

const makeFile = (size: number) => ({ size }) as Express.Multer.File;

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FileSizePipe,
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue(MAX) } },
      ],
    }).compile();

    pipe = module.get(FileSizePipe);
  });

  it('throws 400 with VALIDATION_ERROR when no file is provided', () => {
    let caught: HttpException | undefined;
    try {
      pipe.transform(undefined as never);
    } catch (e) {
      caught = e as HttpException;
    }

    expect(caught).toBeInstanceOf(HttpException);
    expect(caught?.getStatus()).toBe(400);
    expect(caught?.getResponse()).toMatchObject({ code: ErrorCode.VALIDATION_ERROR });
  });

  it('throws 413 with FILE_TOO_LARGE when file size exceeds the limit', () => {
    let caught: HttpException | undefined;
    try {
      pipe.transform(makeFile(MAX + 1));
    } catch (e) {
      caught = e as HttpException;
    }

    expect(caught).toBeInstanceOf(HttpException);
    expect(caught?.getStatus()).toBe(413);
    expect(caught?.getResponse()).toMatchObject({ code: ErrorCode.FILE_TOO_LARGE });
  });

  it('returns the file unchanged when size is within the limit', () => {
    const file = makeFile(MAX - 1);
    expect(pipe.transform(file)).toBe(file);
  });

  it('returns the file unchanged when size equals the limit exactly', () => {
    const file = makeFile(MAX);
    expect(pipe.transform(file)).toBe(file);
  });
});
