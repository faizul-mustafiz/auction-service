import { NextFunction, Request, Response } from 'express';
import { authRequestBody } from '../validators/authRequestBody.validator';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';

export const ValidateAuthRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {email, password} is present in request body and validate using joi
     * * if any of these not provided send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const result = await authRequestBody.validateAsync(req.body);
    Logger.debug('auth-request-body-validation-result: %s', result);
    next();
  } catch (error: any) {
    const errorMessage = `Any of these fields {email, password} not provided or incorrect. ${error.details[0].message}`;
    error = new BadRequestError('validateAuthRequestBody-error', errorMessage);
    next(error);
  }
};
