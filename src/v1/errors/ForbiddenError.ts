import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class ForbiddenError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.FORBIDDEN,
      isOperational: true,
    };
    super(errorArg);
  }
}
