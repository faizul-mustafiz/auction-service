import { createHash } from 'crypto';
import { v4 } from 'uuid';
import { generate } from 'otp-generator';
import { TokenType } from '../enums/tokenType.enum';
import { AuthActionType } from '../enums/authActionType.enum';

/**
 * * The data must be of type string or an instance of Buffer, TypedArray, or DataView.
 * * If you want to pass json first stringify and then pass the data.
 */
export const generateIdentityHash = (data: any) => {
  return createHash('sha1').update(data).digest('hex');
};
export const generateTokenId = () => {
  return v4();
};
export const generateTokenPayloadForRedis = (
  user: any,
  type: TokenType,
  tokenId: string,
) => {
  return {
    email: user.email,
    id: user.id,
    type: type,
    tokenId: tokenId,
  };
};
export const generateVerifyTokenPayloadForRedis = (
  payload: any,
  actionType: AuthActionType,
  otp: string,
) => {
  return actionType == AuthActionType.signUp
    ? {
        email: payload.email,
        password: payload.password,
        actionType: actionType,
        otp: otp,
        tokenType: TokenType.Verify,
      }
    : {
        email: payload.email,
        actionType: actionType,
        otp: otp,
        tokenType: TokenType.Verify,
      };
};
export const generateChangePasswordTokenPayloadForRedis = (
  email: string,
  type: TokenType,
  otp: string,
) => {
  return {
    email: email,
    type: type,
    otp: otp,
  };
};
export const generateOtp = (length: number) => {
  return generate(length, {
    digits: true,
    upperCaseAlphabets: true,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};
