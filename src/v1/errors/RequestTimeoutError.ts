import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class RequestTimeoutError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.REQUEST_TIMEOUT,
      isOperational: true,
    };
    super(errorArg);
  }
}
