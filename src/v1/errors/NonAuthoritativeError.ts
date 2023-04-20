import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class NonAuthoritativeError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.NON_AUTHORITATIVE,
      isOperational: true,
    };
    super(errorArg);
  }
}
