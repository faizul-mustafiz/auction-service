import { NextFunction, Request, Response } from 'express';
import { depositRequestBody } from '../validators/depositRequestBody.validator';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';

export const ValidateDepositRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {amount} is present in request body and validate using joi
     * * if amount not provided send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const result = await depositRequestBody.validateAsync(req.body);
    Logger.debug('deposit-request-body-validation-result: %s', result);
    next();
  } catch (error: any) {
    const errorMessage = `{amount} not provided or incorrect. ${error.details[0].message}`;
    error = new BadRequestError(
      'ValidateDepositRequestBody-error',
      errorMessage,
    );
    next(error);
  }
};
