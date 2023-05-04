import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import { BadRequestError } from '../errors/BadRequestError';
import {
  generateChangePasswordTokenPayloadForRedis,
  generateIdentityHash,
  generateOtp,
} from '../utility/jwt.utility';
import {
  signAccessToken,
  signChangePasswordToken,
  signRefreshToken,
  signVerifyToken,
} from '../helpers/jwt.helper';
import { AuthActionType } from '../enums/authActionType.enum';
import { AuthControllerOrigin } from '../enums/authControllerOrigin.enum';
import { Created, Success } from '../reponses/httpResponse';
import { Logger } from '../loggers/logger';
import { TokenType } from '../enums/tokenType.enum';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import {
  deleteIdentity,
  setIdentityToBlacklist,
} from '../helpers/redis.helper';
import { ConflictError } from '../errors/ConflictError';

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get {email, password } form request body
     */
    let { email, password } = req.body;
    /**
     * * generate password hash form the provided password
     * @function User.generateHash(password)
     */
    password = await User.generateHash(password);
    /**
     * * check if email exists, send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const existingUser = await User.emailExist(email);
    Logger.debug('existingUser: %s', existingUser);
    if (existingUser) {
      throw new BadRequestError(
        'signUp-user-exists:',
        'An account with this email already exists',
      );
    }
    /**
     * * generate OTP for verify sign-up
     */
    const OTP = generateOtp(8);
    /**
     * * generate verify token
     */
    const verifyToken = await signVerifyToken(
      { email, password },
      AuthActionType.signUp,
      OTP,
    );
    /**
     * * generate verify token response
     */
    const result = {
      token: verifyToken,
      code: OTP,
    };
    /**
     * * send 200 success response
     * @function Success(res,payload)
     * @returns {success, message, result}
     */
    return Success(res, {
      message:
        'Please verify with provided token and code for successful sign-up',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin ? error.origin : AuthControllerOrigin.signUp;
    next(error);
  }
};

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get {email, password } form request body
     */
    const { email, password } = req.body;
    /**
     * * check if user email doesn't exists, send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const user = await User.emailExist(email);
    Logger.debug('user: %s', user);
    if (!user) {
      throw new BadRequestError(
        'signIn-user-not-registered',
        'This email is not registered, SignUp first',
      );
    }
    /**
     * * compare the request password and db password
     * * if password doesn't match send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const comparePassword = await user.validatePassword(password);
    Logger.debug('comparePassword: %s', comparePassword);
    if (!comparePassword) {
      throw new BadRequestError('signIn-wrong-password', 'Incorrect password');
    }
    /**
     * * generate OTP for verify sign-up
     */
    const OTP = generateOtp(8);
    /**
     * * generate verify token
     */
    const verifyToken = await signVerifyToken(
      { email, password },
      AuthActionType.signIn,
      OTP,
    );
    /**
     * * generate verify token response
     */
    const result = {
      token: verifyToken,
      code: OTP,
    };
    /**
     * * send 200 success response
     */
    return Success(res, {
      message:
        'Please verify with provided token and code for successful sign-in',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin ? error.origin : AuthControllerOrigin.signIn;
    next(error);
  }
};

const signOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get validateRefreshResponse value form res.locals
     */
    const { email, type, identity, exp } = res.locals.validateRefreshResponse;
    if (email && type && identity && exp) {
      /**
       * * if decoded token type is not refresh, send 401 UnauthorizedError
       * @function UnauthorizedError(origin,message)
       */
      if (type && type != TokenType.Refresh) {
        throw new UnauthorizedError(
          'signOut-token-type-not-refresh',
          'Invalid token',
        );
      }
      /**
       * * check if user email doesn't exists, send 400 BadRequestError
       * @function BadRequestError(origin,message)
       */
      const user = await User.emailExist(email);
      Logger.debug('user: %s', user);
      if (!user) {
        throw new BadRequestError(
          'signOut-user-not-registered',
          'This email is not registered, SignUp first',
        );
      }
      /**
       * * blacklist existing token identity and then delete the refresh token identity
       */
      const backListTokenIdentityResponse = await setIdentityToBlacklist(
        identity,
        exp,
      );
      Logger.debug(
        'backListTokenIdentityResponse: %s',
        backListTokenIdentityResponse,
      );
      const deleteTokenIdentityResponse = await deleteIdentity(identity);
      Logger.debug(
        'deleteTokenIdentityResponse: %s',
        deleteTokenIdentityResponse,
      );
      /**
       * * Send 200 success response
       */
      return Success(res, {
        message: 'Sign-Out successful',
        result: {},
      });
    }
  } catch (error: any) {
    error.origin = error.origin ? error.origin : AuthControllerOrigin.signOut;
    next(error);
  }
};

const continueSingUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get validateVerificationResponse value form res.locals
     */
    const { email, password } = res.locals.validateVerificationResponse;
    /**
     * * check if email exists, send 400 bad BadRequestError
     * @function BadRequestError(origin,message)
     */
    const existingUser = await User.emailExist(email);
    Logger.debug('existingUser: %s', existingUser);
    if (existingUser) {
      throw new BadRequestError(
        'continueSignUp-user-exists:',
        'An account with this email already exists',
      );
    }
    /**
     * * creating new User model object and generating password salt.
     */
    const user = new User({
      email: email,
      password: password,
      isVerified: true,
    });
    Logger.debug('user: %s', user);
    /**
     * * generate access token.
     */
    const accessToken = await signAccessToken(user);
    /**
     * * generate refresh token.
     */
    const refreshToken = await signRefreshToken(user);
    /**
     * * save user to mongoDB
     */
    const result: any = await user.save();
    /**
     * * generate verify-sign-up response body
     */
    result._doc = {
      ...result._doc,
      accessToken,
      refreshToken,
    };
    /**
     * * send 201 created response
     */
    return Created(res, {
      message: 'Sign-Up successful',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.continueSingUp;
    next(error);
  }
};
const continueSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get validateVerificationResponse value form res.locals
     */
    const { email } = res.locals.validateVerificationResponse;
    /**
     * * check if user email doesn't exists, send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const user = await User.emailExist(email);
    Logger.debug('user: %s', user);
    if (!user) {
      throw new BadRequestError(
        'continueSignIn-user-not-registered',
        'This email is not registered, SignUp first',
      );
    }
    /**
     * * generate access token.
     */
    const accessToken = await signAccessToken(user);
    /**
     * * generate refresh token.
     */
    const refreshToken = await signRefreshToken(user);
    /**
     * * generate sing-in response body
     */
    const result = {
      accessToken,
      refreshToken,
    };
    /**
     * * Send 200 success response
     */
    return Success(res, {
      message: 'Sign-In successful',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.continueSignIn;
    next(error);
  }
};
const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get passed OTP code value form the res.locals
     */
    const code = res.locals.code;
    /**
     * * get validateVerificationResponse value form res.locals
     */
    const { actionType, otp, tokenType } =
      res.locals.validateVerificationResponse;
    /**
     * * if decoded token type is not verify, send 401 UnauthorizedError
     * @function UnauthorizedError(origin,message)
     */
    if (tokenType && tokenType != TokenType.Verify) {
      throw new UnauthorizedError(
        'verifyAuth-token-type-not-verify',
        'Invalid token',
      );
    }
    /**
     * * if provided code is not equal to redis otp, send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    if (otp && otp != code) {
      throw new BadRequestError('verifyAuth-wrong-otp', 'Invalid code');
    }
    /**
     * * now check  AuthActionType of the verification token redis response
     * * if sign-up then continueSingUp(req, res, next)
     * * if sign-in then continueSignIn(req, res, next)
     */
    if (actionType && actionType == AuthActionType.signUp) {
      await continueSingUp(req, res, next);
    } else if (actionType && actionType == AuthActionType.signIn) {
      await continueSignIn(req, res, next);
    }
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.verifyAuth;
    next(error);
  }
};
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get {email} form request body
     * * if email not provided send 400 bad BadRequestError
     * @param BadRequestError(origin, message)
     */
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError(
        'forgotPassword-email-not-provided',
        'Email not provided',
      );
    }
    /**
     * * check if email doesn't exists, send 400 BadRequestError
     * @param BadRequestError(origin, message)
     */
    const user = await User.emailExist(email);
    Logger.debug('user: %s', user);
    if (!user) {
      throw new BadRequestError(
        'forgotPassword-user-not-registered',
        'This email is not registered, SignUp first',
      );
    }
    /**
     * * generate OTP for change password
     */
    const OTP = generateOtp(8);
    Logger.debug('OTP: %s', OTP);
    /**
     * * generate change password token payload that needs to be stored in redis
     */
    const changePasswordTokenPayload =
      generateChangePasswordTokenPayloadForRedis(
        email,
        TokenType.ChangePassword,
        OTP,
      );
    /**
     * * generate change password token identity hash for redis key
     */
    const changePasswordTokenIdentity = generateIdentityHash(
      JSON.stringify(changePasswordTokenPayload),
    );
    /**
     * * generate change password token.
     */
    const changePasswordToken = await signChangePasswordToken(
      changePasswordTokenIdentity,
      changePasswordTokenPayload,
    );
    /**
     * * generate forgot password response body
     */
    const result = {
      token: changePasswordToken,
      code: OTP,
    };
    /**
     * * send 200 success response
     */
    return Success(res, {
      message:
        'please provided verification code for successful change-password',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.forgotPassword;
    next(error);
  }
};
const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * check if password is given in the body
     * * if there is no verification code or password send 400 BadRequestError
     * @param BadRequestError(origin, message)
     */
    const { new_password } = req.body;
    if (!new_password) {
      throw new BadRequestError(
        'changePassword-new-password-not-provided',
        'Password was not provided',
      );
    }
    /**
     * * get passed OTP code value form the res.locals
     */
    const code = res.locals.code;
    /**
     * * get validateChangePasswordResponse value form res.locals
     */
    const { email, type, otp } = res.locals.validateChangePasswordResponse;
    /**
     * * if decoded token type is not change password, send 401 UnauthorizedError
     * @param UnauthorizedError(origin, message)
     */
    if (type != TokenType.ChangePassword) {
      throw new UnauthorizedError(
        'changePassword-token-type-not-change',
        'Invalid token',
      );
    }
    /**
     * * if provided code is not equal to redis otp, send 400 BadRequestError
     * @param BadRequestError(origin, message)
     */
    if (otp != code) {
      throw new BadRequestError('changePassword-wrong-otp', 'Invalid code');
    }
    /**
     * * check if user email doesn't exists, send 400 BadRequestError
     * @param BadRequestError(origin, message)
     */
    const user = await User.emailExist(email);
    Logger.debug('user: %s', user);
    if (!user) {
      throw new BadRequestError(
        'changePassword-user-not-registered',
        'This email is not registered, SignUp first',
      );
    }
    /**
     * * compare the new_password with the existing password
     * * if the new_password and the old_password is same send 409 ConflictError
     * @param ConflictError(origin, message)
     */
    const comparePassword = await user.validatePassword(new_password);
    Logger.debug('comparePassword: %s', comparePassword);
    if (comparePassword) {
      throw new ConflictError(
        'changePassword-provided-password-old-password',
        'Provided password is among the old passwords, please try with a different password',
      );
    }
    /**
     * * generate hash form the new_password
     * * sand assign the newPasswordHash as the current password
     * * then save the user with new password
     */
    const newPasswordHash = await User.generateHash(new_password);
    Logger.debug('newPasswordHash: %s', newPasswordHash);
    user.password = newPasswordHash;
    await user.save();
    /**
     * * send 200 success response
     */
    return Success(res, {
      message: 'Successfully changed password',
      result: {},
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.changePassword;
    next(error);
  }
};
const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get validateRefreshResponse value form res.locals
     */
    const { email, type, identity, exp } = res.locals.validateRefreshResponse;
    if (email && type && identity && exp) {
      /**
       * * if decoded token type is not refresh, send 401 UnauthorizedError
       * @param UnauthorizedError(origin, message)
       */
      if (type && type != TokenType.Refresh) {
        throw new UnauthorizedError(
          'refresh-token-type-not-refresh',
          'Invalid token',
        );
      }
      /**
       * * check if user email doesn't exists, send 400 BadRequestError
       * @param BadRequestError(origin, message)
       */
      const user = await User.emailExist(email);
      Logger.debug('user: %s', user);
      if (!user) {
        throw new BadRequestError(
          'refresh-user-not-registered',
          'This email is not registered, SignUp first',
        );
      }

      /**
       * * blacklist existing token identity and then generate new access and refresh token pair
       */
      const backListTokenIdentityResponse = await setIdentityToBlacklist(
        identity,
        exp,
      );
      Logger.debug(
        'backListTokenIdentityResponse: %s',
        backListTokenIdentityResponse,
      );
      /**
       * * generate access token.
       */
      const accessToken = await signAccessToken(user);

      /**
       * * generate refresh token.
       */
      const refreshToken = await signRefreshToken(user);
      /**
       * * generate sing-in response body
       */
      const result = {
        accessToken,
        refreshToken,
      };
      /**
       * * Send 200 success response
       */
      return Success(res, {
        message: 'new access and refresh token generation successful',
        result: result,
      });
    }
  } catch (error: any) {
    error.origin = error.origin ? error.origin : AuthControllerOrigin.refresh;
    next(error);
  }
};
const revokeAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get validateAccessResponse value form res.locals
     */
    const { email, type, identity, exp } = res.locals.validateAccessResponse;
    if (email && type && identity && exp) {
      /**
       * * if decoded token type is not refresh, send 401 UnauthorizedError
       * @param UnauthorizedError(origin, message)
       */
      if (type && type != TokenType.Access) {
        throw new UnauthorizedError(
          'revokeAccessToken-token-type-not-access',
          'Invalid token',
        );
      }
      /**
       * * check if user email doesn't exists, send 400 BadRequestError
       * @param BadRequestError(origin, message)
       */
      const user = await User.emailExist(email);
      Logger.debug('user: %s', user);
      if (!user) {
        throw new BadRequestError(
          'revokeAccessToken-user-not-registered',
          'This email is not registered, SignUp first',
        );
      }
      /**
       * * blacklist access token identity and then delete the access token identity
       */
      const backListTokenIdentityResponse = await setIdentityToBlacklist(
        identity,
        exp,
      );
      Logger.debug(
        'backListTokenIdentityResponse: %s',
        backListTokenIdentityResponse,
      );
      const deleteTokenIdentityResponse = await deleteIdentity(identity);
      Logger.debug(
        'deleteTokenIdentityResponse: %s',
        deleteTokenIdentityResponse,
      );
      /**
       * * Send 200 success response
       */
      return Success(res, {
        message: 'Token revoked successful',
        result: {},
      });
    }
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.revokeAccessToken;
    next(error);
  }
};
const revokeRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get validateRefreshResponse value form res.locals
     */
    const { email, type, identity, exp } = res.locals.validateRefreshResponse;
    if (email && type && identity && exp) {
      /**
       * * if decoded token type is not refresh, send 401 UnauthorizedError
       * @param UnauthorizedError(origin, message)
       */
      if (type && type != TokenType.Refresh) {
        throw new UnauthorizedError(
          'revokeRefreshToken-token-type-not-refresh',
          'Invalid token',
        );
      }
      /**
       * * check if user email doesn't exists, send 400 BadRequestError
       * @param BadRequestError(origin, message)
       */
      const user = await User.emailExist(email);
      Logger.debug('user: %s', user);
      if (!user) {
        throw new BadRequestError(
          'revokeRefreshToken-user-not-registered',
          'This email is not registered, SignUp first',
        );
      }

      /**
       * * blacklist existing token identity and then delete the refresh token identity
       */
      const backListTokenIdentityResponse = await setIdentityToBlacklist(
        identity,
        exp,
      );
      Logger.debug(
        'backListTokenIdentityResponse: %s',
        backListTokenIdentityResponse,
      );
      const deleteTokenIdentityResponse = await deleteIdentity(identity);
      Logger.debug(
        'deleteTokenIdentityResponse: %s',
        deleteTokenIdentityResponse,
      );
      /**
       * * Send 200 success response
       */
      return Success(res, {
        message: 'Token revoked successful',
        result: {},
      });
    }
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : AuthControllerOrigin.revokeRefreshToken;
    next(error);
  }
};

export const AuthController = {
  signUp,
  signIn,
  signOut,
  verifyAuth,
  forgotPassword,
  changePassword,
  refresh,
  revokeAccessToken,
  revokeRefreshToken,
};
