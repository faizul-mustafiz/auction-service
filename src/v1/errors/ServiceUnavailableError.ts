import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class ServiceUnavailableError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.SERVICE_UNAVAILABLE,
      isOperational: true,
    };
    super(errorArg);
  }
}
