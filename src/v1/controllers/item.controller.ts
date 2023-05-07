import { NextFunction, Request, Response } from 'express';
import { ItemControllerOrigin } from '../enums/itemControllerOrigin.enum';
import { Item } from '../models/item.model';
import { Logger } from '../loggers/logger';
import { Created, Success } from '../reponses/httpResponse';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { ItemInterface } from '../interfaces/item.interface';
import { ItemStatus } from '../enums/itemStatus.enum';
import { generatePublishItemChanges } from '../utility/item.utility';
import { setOngoingBiddingItemIdentity } from '../helpers/redis.helper';

const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Item.find();
    const count = await Item.count();
    Logger.debug('getAllItems-result: %s', result);
    Logger.debug('getAllItems-count: %s', count);
    /**
     * * if there is no item in the items collection send 204 NotFoundError
     * @function NotFoundError(origin,message)
     */
    if (count === 0) {
      return Success(res, {
        message: 'Item collection is Empty',
        result,
      });
    }
    return Success(res, {
      message: 'Successfully found all item documents',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.getAllItems;
    next(error);
  }
};

const getOneItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    Logger.debug('getOneItem: %s', req.params);
    /**
     * * if there is no itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const itemId = req.params.itemId;
    if (!itemId) {
      throw new NotFoundError(
        'getOneItem-no-itemId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const result = await Item.findOne({ _id: itemId });
    if (!result) {
      throw new NotFoundError(
        'getOneItem-no-item-with-provided-id',
        'No document found by this id',
      );
    }
    return Success(res, {
      message: 'Successfully found item document',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.getOneItem;
    next(error);
  }
};

const createOneItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get validateVerificationResponse value form res.locals
     */
    const { id } = res.locals.validateAccessResponse;
    const { name, startingPrice, duration }: any = req.body;
    /**
     * * check if same product name exists, send 400 BadRequestError
     * @function BadRequestError(origin,message)
     */
    const existingItem = await Item.nameExist(name);
    Logger.debug('existingItem: %s', existingItem);
    if (existingItem) {
      throw new BadRequestError(
        'signUp-user-exists:',
        'An item with this name already exists. Please use different name',
      );
    }
    /**
     * * generation new item object from the request body
     */
    const itemObject: ItemInterface = {
      name: name,
      startingPrice: startingPrice,
      duration: duration,
      isPublished: false,
      status: ItemStatus.draft,
      createdBy: id,
    };
    /**
     * * initiating new item model and saving the data to mongoDB
     */
    const item = new Item(itemObject);
    Logger.debug('item: %s', item);
    const result: any = await item.save();
    /**
     * * send 201 created response
     */
    return Created(res, {
      message: 'Item created',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.createOneItem;
    next(error);
  }
};

const updateOneItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    Logger.debug('updateOneItem: %s', req.params);
    /**
     * * if there is no itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const { itemId } = req.params;
    if (!itemId) {
      throw new NotFoundError(
        'updateOneItem-no-itemId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const updatingItemDocument = await Item.findOne({ _id: itemId });
    if (!updatingItemDocument) {
      throw new NotFoundError(
        'updateOneItem-no-item-with-provided-id',
        'No document found by this id',
      );
    }
    let changes = { ...req.body };
    Logger.debug('changes: %s', changes);
    const updatedItem = Object.assign(updatingItemDocument, changes);
    Logger.debug('updatedItem: %s', updatedItem);
    const result = await updatedItem.save();
    Logger.debug('result: %s', result);
    return Success(res, {
      message: 'Successfully updated item',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.updateOneItem;
    next(error);
  }
};

const deleteOneItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * if there is no itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const { itemId } = req.params;
    if (!itemId) {
      throw new NotFoundError(
        'deleteOneItem-no-itemId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const existingUser = await Item.findOne({ _id: itemId });
    if (!existingUser) {
      throw new NotFoundError(
        'deleteOneItem-no-item-with-provided-id',
        'No document found by this request',
      );
    }
    const result = await Item.findOneAndDelete({ _id: itemId });
    return Success(res, {
      message: 'Successfully deleted item',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.deleteOneItem;
    next(error);
  }
};

const searchItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get validateVerificationResponse value form res.locals
     */
    const { id } = res.locals.validateAccessResponse;
    Logger.debug('userId: %s', id);
    const { status } = req.query;
    Logger.debug('status: %s', status);
    if (!status) {
      throw new BadRequestError(
        'searchItem-wrong-query-param-error',
        'This query param is not supported',
      );
    }
    const items: any[] = await Item.find({
      status: status,
      createdBy: id,
    }).sort({
      createdAt: -1,
    });
    const count = await Item.count();
    const result = {
      items: items,
      totalItems: count,
    };
    return Success(res, {
      message: 'Item search successful',
      result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.searchItem;
    next(error);
  }
};

const publishItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    Logger.debug('publishOneItem: %s', req.params);
    /**
     * * if there is no itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const { itemId } = req.params;
    if (!itemId) {
      throw new NotFoundError(
        'publishItem-no-itemId-param',
        'Invalid path not found',
      );
    }
    /**
     * * if there is no data for provided itemId in request param send 404 NotFoundError
     * @function NotFoundError(origin,message)
     */
    const publishingItemDocument: any = await Item.findOne({
      _id: itemId,
    });
    Logger.debug('publishingItemDocument: %s', publishingItemDocument);
    if (!publishingItemDocument) {
      throw new NotFoundError(
        'publishItem-no-item-with-provided-id',
        'No document found by this id',
      );
    }
    const { isPublished, duration, startingPrice } = publishingItemDocument;
    if (isPublished) {
      throw new BadRequestError(
        'publishItem-is-already-published-error',
        'The item you are trying to publish is already published',
      );
    }
    const changes = generatePublishItemChanges(duration);
    const publishedItem = Object.assign(publishingItemDocument, changes);
    Logger.debug('publishedItem: %s', publishedItem);
    const result = await publishedItem.save();
    Logger.debug('result: %s', result);
    const ongoingBiddingRedisPayload = {
      currentHeightBid: startingPrice,
      windowEndTime: changes.windowEndTime,
    };
    Logger.debug('ongoingBiddingRedisPayload', ongoingBiddingRedisPayload);
    await setOngoingBiddingItemIdentity(
      itemId,
      changes.windowEndTime,
      ongoingBiddingRedisPayload,
    );
    return Success(res, {
      message: 'Successfully published item',
      result: result,
    });
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : ItemControllerOrigin.publishItem;
    next(error);
  }
};
export const ItemController = {
  getAllItems,
  getOneItem,
  createOneItem,
  updateOneItem,
  deleteOneItem,
  searchItem,
  publishItem,
};
