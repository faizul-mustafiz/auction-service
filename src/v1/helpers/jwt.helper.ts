/**
 * * Different type of token signing methods
 * @param signAccessToken(payload)
 * @param signRefreshToken(payload)
 * * identity creation is handled inside these method and not passed as a parameter
 * @param signVerifyToken(identity, payload)
 * @param signResetPasswordToken(identity, payload)
 * @param signChangePasswordToken(identity, payload)
 * * identity parameter is the key that needs to be stored as a key in redis
 * * payload parameter is the payload that needs to be stored in redis.
 * @param setIdentityWithHSet(identity, expiry, payload)
 */

import { JWTConfig } from '../configs/jwt.config';
import { sign } from 'jsonwebtoken';
import { AuthActionType } from '../enums/authActionType.enum';
import { TokenType } from '../enums/tokenType.enum';
import { Logger } from '../loggers/logger';
import {
  generateIdentityHash,
  generateTokenId,
  generateTokenPayloadForRedis,
  generateVerifyTokenPayloadForRedis,
} from '../utility/jwt.utility';
import {
  setChangePasswordTokenIdentity,
  setIdentityWithHSet,
  setVerifyTokenIdentity,
} from './redis.helper';
import { InternalServerError } from '../errors/InternalServerError';
import { TokenPayload } from '../interfaces/tokenPayload.interface';

export const signAccessToken = async (payload: any) => {
  try {
    /**
     * * generate access token id
     */
    const accessTokenId = generateTokenId();
    /**
     * * generate access token payload data that needs to be stored in redis
     */
    const accessTokenPayload = generateTokenPayloadForRedis(
      payload,
      TokenType.Access,
      accessTokenId,
    );
    /**
     * * generate access token identity hash for redis key
     */
    const accessTokenIdentity = generateIdentityHash(
      JSON.stringify(accessTokenPayload),
    );
    /**
     * * generate access token expiry
     */
    const tokenExpire =
      Math.floor(new Date().getTime() / 1000) +
      Number(JWTConfig.accessTokenConfig.expiryTime);
    /**
     * * generate access token payload
     */
    const jwtPayload: TokenPayload = {
      iat: Math.floor(new Date().getTime() / 1000),
      nbf: Math.floor(new Date().getTime() / 1000),
      exp: tokenExpire,
      type: TokenType.Access,
      identity: accessTokenIdentity,
      jti: accessTokenId,
    };
    /**
     * * sign access token with private key
     */
    const accessToken = sign(jwtPayload, JWTConfig.privateKey, {
      algorithm: 'ES512',
    });
    /**
     * * store access token data to redis
     */
    try {
      await setIdentityWithHSet(
        accessTokenIdentity,
        Number(tokenExpire),
        accessTokenPayload,
      );
    } catch (error) {
      throw new InternalServerError(
        'sign-access-token-redis-data-save-error',
        'token data redis save error',
      );
    }
    return accessToken;
  } catch (error) {
    throw new InternalServerError(
      'sign-access-token-base-error',
      'access token generation error',
    );
  }
};
export const signRefreshToken = async (payload: any) => {
  try {
    /**
     * * generate refresh token id
     */
    const refreshTokenId = generateTokenId();
    /**
     * * generate refresh token payload data that needs to be stored in redis
     */
    const refreshTokenPayload = generateTokenPayloadForRedis(
      payload,
      TokenType.Refresh,
      refreshTokenId,
    );
    /**
     * * generate refresh token identity hash for redis key
     */
    const refreshTokenIdentity = generateIdentityHash(
      JSON.stringify(refreshTokenPayload),
    );
    const tokenExpire =
      Math.floor(new Date().getTime() / 1000) +
      Number(JWTConfig.refreshTokenConfig.expiryTime);
    const jwtPayload: TokenPayload = {
      iat: Math.floor(new Date().getTime() / 1000),
      nbf: Math.floor(new Date().getTime() / 1000),
      exp: tokenExpire,
      type: TokenType.Refresh,
      identity: refreshTokenIdentity,
      jti: refreshTokenId,
    };
    const refreshToken = sign(jwtPayload, JWTConfig.privateKey, {
      algorithm: 'ES512',
    });
    /**
     * * store refresh token data to redis
     */
    try {
      await setIdentityWithHSet(
        refreshTokenIdentity,
        Number(tokenExpire),
        refreshTokenPayload,
      );
    } catch (error) {
      throw new InternalServerError(
        'sign-refresh-token-redis-data-save-error',
        'token data redis save error',
      );
    }
    return refreshToken;
  } catch (error) {
    throw new InternalServerError(
      'sign-refresh-token-base-error',
      'refresh token generation error',
    );
  }
};

export const signVerifyToken = async (
  payload: any,
  actionType: AuthActionType,
  otp: string,
) => {
  try {
    /**
     * * generate verify token id
     */
    const verifyTokenId = generateTokenId();
    /**
     * * generate verify token payload that needs to be stored in redis
     */
    const verifyTokenPayload = generateVerifyTokenPayloadForRedis(
      payload,
      actionType,
      otp,
    );
    Logger.debug('verifyTokenPayload: %s', verifyTokenPayload);
    /**
     * * generate verify token identity hash for redis key
     */
    const verifyTokenIdentity = generateIdentityHash(
      JSON.stringify(verifyTokenPayload),
    );
    Logger.debug('verifyTokenIdentity: %s', verifyTokenIdentity);
    /**
     * * generate verify token expiry
     */
    const tokenExpire =
      Math.floor(new Date().getTime() / 1000) +
      Number(JWTConfig.verifyTokenConfig.expiryTime);
    /**
     * * generate verify token payload
     */
    const jwtPayload: TokenPayload = {
      iat: Math.floor(new Date().getTime() / 1000),
      nbf: Math.floor(new Date().getTime() / 1000),
      exp: tokenExpire,
      type: TokenType.Verify,
      identity: verifyTokenIdentity,
      jti: verifyTokenId,
    };
    const verifyToken = sign(jwtPayload, JWTConfig.verifyTokenConfig.secret);
    Logger.debug('verify-token: %s', verifyToken);
    /**
     * * store verify token data to redis
     */
    try {
      await setVerifyTokenIdentity(
        verifyTokenIdentity,
        Number(tokenExpire),
        verifyTokenPayload,
      );
    } catch (error) {
      throw new InternalServerError(
        'sign-verify-token-redis-data-save-error',
        'token data redis save error',
      );
    }
    return verifyToken;
  } catch (error) {
    throw new InternalServerError(
      'sign-verify-token-base-error',
      'verify token generation error',
    );
  }
};

export const signChangePasswordToken = async (
  identity: string,
  payload: any,
) => {
  try {
    /**
     * * generate change password token id
     */
    const jwtId = generateTokenId();
    /**
     * * generate change password token expiry
     */
    const tokenExpire =
      Math.floor(new Date().getTime() / 1000) +
      Number(JWTConfig.changePasswordTokenConfig.expiryTime);

    /**
     * * generate verify token payload
     */
    const jwtPayload: TokenPayload = {
      iat: Math.floor(new Date().getTime() / 1000),
      nbf: Math.floor(new Date().getTime() / 1000),
      exp: tokenExpire,
      type: TokenType.ChangePassword,
      identity: identity,
      jti: jwtId,
    };
    const changePasswordToken = sign(
      jwtPayload,
      JWTConfig.changePasswordTokenConfig.secret,
    );
    Logger.debug('change-password-token: %s', changePasswordToken);
    /**
     * * store change password token data to redis
     */
    try {
      await setChangePasswordTokenIdentity(
        identity,
        Number(tokenExpire),
        payload,
      );
    } catch (error) {
      throw new InternalServerError(
        'sign-change-password-token-redis-data-save-error',
        'token data redis save error',
      );
    }
    return changePasswordToken;
  } catch (error) {
    throw new InternalServerError(
      'sign-change-password-token-base-error',
      'change password token generation error',
    );
  }
};
