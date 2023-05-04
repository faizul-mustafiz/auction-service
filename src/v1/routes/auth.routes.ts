import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
/**
 * * JWT header check, token validator, and request body validation middleware imports
 */
import { HasAuthorization } from '../middlewares/hasAuthorization.middleware';
import { ValidateVerification } from '../middlewares/validateVerification.middleware';
import { ValidateAccess } from '../middlewares/validateAccess.middleware';
import { ValidateRefresh } from '../middlewares/validateRefresh.middleware';
import { ValidateChangePassword } from '../middlewares/validateChangePassword.middleware';

import { ValidateVerifyRequestBody } from '../middlewares/validateVerifyRequestBody.middleware';
import { ValidateAuthRequestBody } from '../middlewares/validateAuthRequestBody.middleware';
import { ValidateForgotPasswordRequestBody } from '../middlewares/validateForgotPasswordRequestBody.middleware';
import { ValidateChangePasswordRequestBody } from '../middlewares/validateChangePasswordRequestBody.middleware';

const authRouter = Router();
authRouter.post('/sign-up', [ValidateAuthRequestBody], AuthController.signUp);
authRouter.post('/sign-in', [ValidateAuthRequestBody], AuthController.signIn);
authRouter.post(
  '/sign-out',
  [HasAuthorization, ValidateRefresh],
  AuthController.signOut,
);
authRouter.post(
  '/verify',
  [HasAuthorization, ValidateVerifyRequestBody, ValidateVerification],
  AuthController.verifyAuth,
);
authRouter.post(
  '/forgot-password',
  [ValidateForgotPasswordRequestBody],
  AuthController.forgotPassword,
);
authRouter.post(
  '/change-password',
  [HasAuthorization, ValidateChangePasswordRequestBody, ValidateChangePassword],
  AuthController.changePassword,
);
authRouter.post(
  '/refresh',
  [HasAuthorization, ValidateRefresh],
  AuthController.refresh,
);
authRouter.post(
  '/revoke-at',
  [HasAuthorization, ValidateAccess],
  AuthController.revokeAccessToken,
);
authRouter.post(
  '/revoke-rt',
  [HasAuthorization, ValidateRefresh],
  AuthController.revokeRefreshToken,
);

export const AuthRouter = authRouter;
