import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors/BadRequestError';

export const InvalidPath = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /**
   * * if the path is invalid send 400 BadRequestError
   *@function BadRequestError(origin,message)
   */
  throw new BadRequestError(
    'invalid-path-base-error',
    'This path is not valid',
  );
};
