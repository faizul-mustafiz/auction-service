import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import { Logger } from '../loggers/logger';
import { NonAuthoritativeError } from '../errors/NonAuthoritativeError';
import { Success } from '../reponses/httpResponse';
import { UserControllerOrigin } from '../enums/userControllerOrigin.enum';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';

const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await User.find();
    const count = await User.count();
    Logger.debug('getAllUser-result: %s', result);
    Logger.info('getAllUser-count: %s', count);
    /**
     * * if there is no user in the user collection send 203 NonAuthoritativeError
     * @param NonAuthoritativeError(origin, message)
     */
    if (count === 0) {
      throw new NonAuthoritativeError(
        'getAllUser-count-zero',
        'User collection is Empty',
      );
    }
    return Success(res, {
      message: 'Successfully found all user documents',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : UserControllerOrigin.getAllUser;
    next(error);
  }
};
const getOneUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    Logger.debug('getOneUser: %s', req.params);
    /**
     * * if there is no userId in request param send 404 NotFoundError
     * @param NotFoundError(origin, message)
     */
    const { userId } = req.params;
    if (!userId) {
      throw new NotFoundError(
        'getOneUser-no-userId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided userId in request param send 404 NotFoundError
     * @param NotFoundError(origin, message)
     */
    const result = await User.findOne({ _id: userId });
    if (!result) {
      throw new NotFoundError(
        'getOneUser-no-user-with-provided-id',
        'No document found by this request',
      );
    }
    return Success(res, {
      message: 'Successfully found user document',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : UserControllerOrigin.getOneUser;
    next(error);
  }
};
const updateOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * if there is no userId in request param send 404 NotFoundError
     * @param NotFoundError(origin, message)
     */
    const { userId } = req.params;
    if (!userId) {
      throw new NotFoundError(
        'updateOneUser-no-userId-param',
        'Invalid path not found',
      );
    }
    const { email } = req.body;
    if (email) {
      const existingUser = await User.emailExist(email);
      Logger.debug('existingUser: %s', existingUser);
      /**
       * * if the updating email matches to an existing user email send 400 BadRequestError
       * @param BadRequestError(origin, message)
       */
      if (existingUser && existingUser.id != userId) {
        throw new BadRequestError(
          'update-email-is-of-an-existing-user',
          'There is already an account present with the email provided for update. Please login or try forgot password',
        );
      }
    }

    const updatingUserDocument = await User.findOne({ _id: userId });
    Logger.debug('updatingUserDocument: %s', updatingUserDocument);
    if (!updatingUserDocument) {
      throw new NotFoundError(
        'updateOneUser-no-user-with-provided-id',
        'No document found by this request',
      );
    }

    let changes = { ...req.body };
    if (changes.password) {
      changes.password = await User.generateHash(changes.password);
    }
    Logger.debug('changes: %s', changes);
    const updatedUser = Object.assign(updatingUserDocument, changes);
    Logger.debug('updatedUser: %s', updatedUser);
    const result = await updatedUser.save();
    Logger.debug('result: %s', result);
    return Success(res, {
      message: 'Successfully updated user',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : UserControllerOrigin.updateOneUser;
    next(error);
  }
};
const deleteOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * if there is no userId in request param send 404 NotFoundError
     * @param NotFoundError(origin, message)
     */
    const { userId } = req.params;
    if (!userId) {
      throw new NotFoundError(
        'deleteOneUser-no-userId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided userId in request param send 404 NotFoundError
     * @param NotFoundError(origin, message)
     */
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      throw new NotFoundError(
        'deleteOneUser-no-user-with-provided-id',
        'No document found by this request',
      );
    }
    const result = await User.findOneAndDelete({ _id: userId });
    return Success(res, {
      message: 'Successfully deleted user',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : UserControllerOrigin.deleteOneUser;
    next(error);
  }
};

export const UserController = {
  getAllUser,
  getOneUser,
  updateOneUser,
  deleteOneUser,
};
