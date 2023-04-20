import { HttpCode } from '../enums/httpCode.enum';
import { BaseError, ErrorArgument } from './BaseError';

export class UnprocessableEntityError extends BaseError {
  constructor(origin: string, message: string) {
    const errorArg: ErrorArgument = {
      origin: origin,
      message: message,
      statusCode: HttpCode.UNPROCESSABLE_ENTITY,
      isOperational: true,
    };
    super(errorArg);
  }
}
