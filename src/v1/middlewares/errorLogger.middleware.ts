import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../errors/BaseError';
import { Logger } from '../loggers/logger';

export const ErrorLogger = (
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Logger.error(error.origin, error);
  next(error);
};
