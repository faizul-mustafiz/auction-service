import { HttpCode } from '../enums/httpCode.enum';

export interface ErrorArgument {
  origin: string;
  message: string;
  statusCode: HttpCode;
  isOperational: boolean;
}

export class BaseError extends Error {
  public origin: string;
  public message: string;
  public statusCode: number;
  public isOperational: boolean;
  constructor(errorArg: ErrorArgument) {
    super(errorArg.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.origin = errorArg.origin;
    this.message = errorArg.message;
    this.statusCode = errorArg.statusCode;
    this.isOperational = errorArg.isOperational;
    Error.captureStackTrace(this);
  }
}
