/**
 * Error codes used across the application.
 * These are returned in the error response body: { error: { code, message } }
 */

export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // File errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_GONE = 'FILE_GONE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_WRONG_PASSWORD = 'FILE_WRONG_PASSWORD',
  FILE_TYPE_FORBIDDEN = 'FILE_TYPE_FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * HTTP status codes corresponding to each error code
 */
export const ErrorHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_UNAUTHORIZED]: 403,

  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.FILE_GONE]: 410,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.FILE_WRONG_PASSWORD]: 403,
  [ErrorCode.FILE_TYPE_FORBIDDEN]: 415,

  [ErrorCode.VALIDATION_ERROR]: 400,

  [ErrorCode.SERVER_ERROR]: 500,
};

/**
 * Default human-readable messages for each error code.
 * These can be overridden when throwing the error.
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You do not have permission to perform this action',

  [ErrorCode.FILE_NOT_FOUND]: 'The requested file does not exist',
  [ErrorCode.FILE_GONE]: 'This file has been deleted or has expired',
  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds the maximum limit of 1 GB',
  [ErrorCode.FILE_WRONG_PASSWORD]: 'Incorrect password',
  [ErrorCode.FILE_TYPE_FORBIDDEN]: 'This file type is not allowed',

  [ErrorCode.VALIDATION_ERROR]: 'The request contains invalid data',

  [ErrorCode.SERVER_ERROR]: 'An unexpected error occurred. Please try again later.',
};
