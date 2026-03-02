import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode, ErrorMessage } from '../constants/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as Record<string, unknown>;

      if (typeof body === 'object' && body.code && body.message) {
        return response.status(status).json({ error: body });
      }

      if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
        return response.status(status).json({
          error: {
            code: ErrorCode.FILE_TOO_LARGE,
            message: ErrorMessage[ErrorCode.FILE_TOO_LARGE],
          },
        });
      }

      if (status === HttpStatus.BAD_REQUEST) {
        return response.status(status).json({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: ErrorMessage[ErrorCode.VALIDATION_ERROR],
          },
        });
      }

      return response.status(status).json({
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: exception.message,
        },
      });
    }

    console.error(exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: ErrorCode.SERVER_ERROR,
        message: ErrorMessage[ErrorCode.SERVER_ERROR],
      },
    });
  }
}
