import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { HasAuthorization } from '../middlewares/hasAuthorization.middleware';
import { ValidateAccess } from '../middlewares/validateAccess.middleware';
import { ValidateItemRequestBody } from '../middlewares/validateItemRequestBody';

const itemRouter = Router();

itemRouter.get(
  '/',
  [HasAuthorization, ValidateAccess],
  ItemController.getAllItems,
);
itemRouter.get(
  '/search',
  [HasAuthorization, ValidateAccess],
  ItemController.searchItem,
);
itemRouter.get(
  '/:itemId',
  [HasAuthorization, ValidateAccess],
  ItemController.getOneItem,
);
itemRouter.post(
  '/',
  [HasAuthorization, ValidateItemRequestBody, ValidateAccess],
  ItemController.createOneItem,
);
itemRouter.post(
  '/:itemId',
  [HasAuthorization, ValidateAccess],
  ItemController.updateOneItem,
);
itemRouter.delete(
  '/:itemId',
  [HasAuthorization, ValidateAccess],
  ItemController.deleteOneItem,
);
itemRouter.post(
  '/publish/:itemId',
  [HasAuthorization, ValidateAccess],
  ItemController.publishItem,
);

export const ItemRouter = itemRouter;
