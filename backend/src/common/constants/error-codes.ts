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
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email ou mot de passe invalide',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Votre session a expiré. Veuillez vous reconnecter.',
  [ErrorCode.AUTH_UNAUTHORIZED]: "Vous n'avez pas la permission d'effectuer cette action",

  [ErrorCode.FILE_NOT_FOUND]: "Le fichier demandé n'existe pas",
  [ErrorCode.FILE_GONE]: 'Ce fichier a été supprimé ou a expiré',
  [ErrorCode.FILE_TOO_LARGE]: 'La taille du fichier dépasse la limite maximale de 1 Go',
  [ErrorCode.FILE_WRONG_PASSWORD]: 'Mot de passe incorrect',
  [ErrorCode.FILE_TYPE_FORBIDDEN]: "Ce type de fichier n'est pas autorisé",

  [ErrorCode.VALIDATION_ERROR]: 'La requête contient des données invalides',

  [ErrorCode.SERVER_ERROR]: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
};
