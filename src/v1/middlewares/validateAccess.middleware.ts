import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { JWTConfig } from '../configs/jwt.config';
import { Logger } from '../loggers/logger';
import {
  getHSetIdentityPayload,
  isIdentityBlacklisted,
  isIdentityExists,
} from '../helpers/redis.helper';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export const ValidateAccess = async (
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
     * * decode access token and check if the token is a valid token
     * * jwt token related error send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * if the decoded token identity is not present in redis send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * if the decoded token identity is blacklisted in redis send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * Token is a valid token then fetch the token data from redis.
     * * if there is no data against the token identity send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     * * pass redis data as res.locals.validateAccessResponse
     * * res.locals are persistent throughout the request life cycle or simply to say until the request is resolved
     */
    try {
      const decoded: any = verify(token, JWTConfig.publicKey, {
        algorithms: ['ES512'],
      });
      Logger.debug('decoded: %s', decoded);
      if (decoded && decoded.identity) {
        const identityExists = await isIdentityExists(decoded.identity);
        if (!identityExists) {
          throw new UnauthorizedError(
            'validateAccess-token-identity-does-not-exists-in-redis',
            'Invalid token',
          );
        }
        const identityBlackListed = await isIdentityBlacklisted(
          decoded.identity,
        );
        if (identityBlackListed) {
          throw new UnauthorizedError(
            'validateAccess-token-identity-is-blacklisted',
            'Invalid token',
          );
        }
        const accessTokenRedisResponse = await getHSetIdentityPayload(
          decoded.identity,
        );
        Logger.debug('accessTokenRedisResponse: %s', accessTokenRedisResponse);
        if (!accessTokenRedisResponse) {
          throw new UnauthorizedError(
            'validateAccess-token-identity-data-does-not-exists-in-redis',
            'Invalid token',
          );
        } else {
          const mergedRedisResponseAndDecodedData = {
            ...accessTokenRedisResponse,
            ...decoded,
          };
          res.locals.validateAccessResponse = mergedRedisResponseAndDecodedData;
          next();
        }
      }
    } catch (error: any) {
      const origin = error.origin
        ? error.origin
        : 'validateAccess-token-decode-error';
      throw new UnauthorizedError(origin, 'Invalid token');
    }
  } catch (error: any) {
    error.origin = error.origin ? error.origin : 'validateAccess-base-error:';
    next(error);
  }
};
