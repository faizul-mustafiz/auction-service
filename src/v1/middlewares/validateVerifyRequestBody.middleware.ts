import { NextFunction, Request, Response } from 'express';
import { verifyRequestBody } from '../validators/verifyRequestBody.validator';
import { Logger } from '../loggers/logger';
export const ValidateVerifyRequestBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if {code} is present in request body and validate using joi
     * * if code not provided send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const result = await verifyRequestBody.validateAsync(req.body);
    Logger.debug('verify-request-body-validation-result: %s', result);
    /**
     * * pass the OTP code, need for verification as res.locals.code
     * * res.locals are persistent throughout the request life cycle or simply to say until the request is resolved
     */
    const { code } = req.body;
    res.locals.code = code;
    next();
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : 'ValidateVerifyRequestBody-base-error:';
    next(error);
  }
};
