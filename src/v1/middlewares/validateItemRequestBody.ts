import { NextFunction, Request, Response } from 'express';
import { itemRequestBody } from '../validators/itemRequestBody.validator';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';

export const ValidateItemRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {name, startingPrice, duration} is present in request body and validate using joi
     * * if any of these not provided send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const result = await itemRequestBody.validateAsync(req.body);
    Logger.debug('item-request-body-validation-result: %s', result);
    next();
  } catch (error: any) {
    const errorMessage = `Any of these fields {name, startingPrice, duration} not provided or incorrect. ${error.details[0].message}`;
    error = new BadRequestError('ValidateItemRequestBody-error', errorMessage);
    next(error);
  }
};
