import { Router } from 'express';
import { UserController } from '../controllers';
import { HasAuthorization } from '../middlewares/hasAuthorization.middleware';
import { ValidateAccess } from '../middlewares/validateAccess.middleware';

const userRouter = Router();
userRouter.get(
  '/',
  [HasAuthorization, ValidateAccess],
  UserController.getAllUser,
);
userRouter.get(
  '/:userId',
  [HasAuthorization, ValidateAccess],
  UserController.getOneUser,
);
userRouter.post(
  '/:userId',
  [HasAuthorization, ValidateAccess],
  UserController.updateOneUser,
);
userRouter.delete(
  '/:userId',
  [HasAuthorization, ValidateAccess],
  UserController.deleteOneUser,
);

export const UserRouter = userRouter;
