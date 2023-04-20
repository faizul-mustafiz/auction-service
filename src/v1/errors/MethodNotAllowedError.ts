import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class MethodNotAllowedError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.METHOD_NOT_ALLOWED,
      isOperational: true,
    };
    super(errorArg);
  }
}
