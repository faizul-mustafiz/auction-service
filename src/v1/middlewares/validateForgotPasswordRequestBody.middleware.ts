import { NextFunction, Request, Response } from 'express';
import { forgotPasswordRequestBody } from '../validators/forgotPasswordRequestBody.validator';
import { BadRequestError } from '../errors/BadRequestError';
import { Logger } from '../loggers/logger';

export const ValidateForgotPasswordRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {email} is present in request body and validate using joi
     * * if email provided send 400 bad request
     * @function BadRequestError(origin,message)
     */
    const result = await forgotPasswordRequestBody.validateAsync(req.body);
    Logger.debug('forgot-password-request-body-validation-result: %s', result);
    next();
  } catch (error: any) {
    const errorMessage = `{email} not provided or incorrect. ${error.details[0].message}`;
    error = new BadRequestError(
      'validateForgotPasswordRequestBody-error',
      errorMessage,
    );
    next(error);
  }
};
