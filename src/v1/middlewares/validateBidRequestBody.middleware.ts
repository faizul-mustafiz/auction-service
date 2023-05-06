import { NextFunction, Request, Response } from 'express';
import { bidRequestBody } from '../validators/bidRequestBody.validator';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';

export const ValidateBidRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {bid} is present in request body and validate using joi
     * * if bid amount not provided send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const result = await bidRequestBody.validateAsync(req.body);
    Logger.debug('change-password-request-body-validation-result: %s', result);
    next();
  } catch (error: any) {
    const errorMessage = `{bid} amount not provided or incorrect. ${error.details[0].message}`;
    error = new BadRequestError('ValidateBidRequestBody-error', errorMessage);
    next(error);
  }
};
