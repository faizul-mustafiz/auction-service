import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { JWTConfig } from '../configs/jwt.config';
import { Logger } from '../loggers/logger';
import {
  getVerifyTokenIdentity,
  isVerifyTokenIdentityExists,
} from '../helpers/redis.helper';

export const ValidateVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get the passed token value form the res.locals
     */
    const token = res.locals.token;
    /**
     * * decode verify token and check if the token is a valid token
     * * jwt token related error send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * if the decoded token identity is not present in redis send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * Token is a valid token then fetch the token data from redis.
     * * if there is no data against the token identity send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * pass redis data as res.locals.validateVerificationResponse
     * * res.locals are persistent throughout the request life cycle or simply to say until the request is resolved
     */
    try {
      const decoded: any = verify(token, JWTConfig.verifyTokenConfig.secret);
      Logger.debug('decoded: %s', decoded);
      if (decoded && decoded.identity) {
        const identityExists = await isVerifyTokenIdentityExists(
          decoded.identity,
        );
        if (!identityExists) {
          throw new UnauthorizedError(
            'validateVerification-token-identity-does-not-exists-in-redis',
            'Invalid token',
          );
        }
        const verifyTokenRedisResponse = await getVerifyTokenIdentity(
          decoded.identity,
        );
        Logger.debug('verifyTokenRedisResponse: %s', verifyTokenRedisResponse);
        if (!verifyTokenRedisResponse) {
          throw new UnauthorizedError(
            'validateVerification-token-identity-data-does-not-exists-in-redis',
            'Invalid token',
          );
        } else {
          res.locals.validateVerificationResponse = verifyTokenRedisResponse;
          next();
        }
      }
    } catch (error: any) {
      const origin = error.origin
        ? error.origin
        : 'validateVerification-token-decode-error';
      throw new UnauthorizedError(origin, 'Invalid token');
    }
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : 'ValidateVerification-base-error:';
    next(error);
  }
};
