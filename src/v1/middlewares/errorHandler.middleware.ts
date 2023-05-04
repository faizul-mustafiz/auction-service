import { BaseError } from '../errors/BaseError';
import { NextFunction, Request, Response } from 'express';

export const ErrorHandler = (
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorStatus = error.statusCode || 500;
  const errorMessage = error.message || 'Oops! something went wrong';
  return res.status(errorStatus).json({
    success: false,
    message: errorMessage,
    result: {},
  });
};
