import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class BadGatewayError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.BAD_GATEWAY,
      isOperational: true,
    };
    super(errorArg);
  }
}
