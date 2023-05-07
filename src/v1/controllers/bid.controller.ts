import { NextFunction, Request, Response } from 'express';
import { BidControllerOrigin } from '../enums/bidControllerOrigin.enum';
import { Item } from '../models/item.model';
import { Bid } from '../models/bid.model';
import { NotFoundError } from '../errors/NotFoundError';
import {
  setIndividualBiddingItemIdentity,
  setOngoingBiddingItemIdentity,
} from '../helpers/redis.helper';
import { Success } from '../reponses/httpResponse';
import { Logger } from '../loggers/logger';

const bidItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * * get user id from res.locals.validateAccessResponse
     */
    const { id } = res.locals.validateAccessResponse;
    /**
     * * get item_id form request params
     */
    const { itemId } = req.params;
    /**
     * * get bid amount form request body
     */
    const { bid } = req.body;
    /**
     * * destructure {currentHeightBid,duration,individualBiddingIdentity,currentBidTime, windowEndTime}
     * * from res.locals.validatedOngoingBiddingInfo
     */
    const {
      currentHeightBid,
      duration,
      individualBiddingIdentity,
      currentBidTime,
      windowEndTime,
    } = res.locals.validatedOngoingBiddingInfo;
    /**
     * * get the item from items collection using item_id
     * * if not present send  NotFoundError
     * @function NotFoundError(origin,message)
     */
    const updatingItemDocument = await Item.findOne({ _id: itemId });
    if (!updatingItemDocument) {
      throw new NotFoundError(
        'bidItem-no-item-with-provided-id',
        'No document found by this id',
      );
    }
    /**
     * * add bid amount as currentHeightBid in the item document
     * * add requesting userId as currentHighestBidder in the item document
     * * save the document to db
     */
    const itemDocumentChanges = {
      currentHighestBid: bid,
      currentHighestBidder: id,
    };
    const updatedItemDocument = Object.assign(
      updatingItemDocument,
      itemDocumentChanges,
    );
    const itemResult = await updatedItemDocument.save();
    Logger.debug('itemResult', itemResult);
    /**
     * * generate new bid document and save to bids collection
     */
    const newBid: any = new Bid({
      userId: id,
      itemId: itemId,
      heightBid: bid,
    });
    const bidResult = await newBid.save();
    Logger.debug(bidResult, bidResult);
    /**
     * * generate ongoingBiddingRedisPayload and save data to redis
     * @function setOngoingBiddingItemIdentity(identity,expiry,payload)
     */
    const ongoingBiddingRedisPayload = {
      currentHeightBid: bid,
      windowEndTime: windowEndTime,
    };
    await setOngoingBiddingItemIdentity(
      itemId,
      duration,
      ongoingBiddingRedisPayload,
    );
    /**
     * * generate individualBiddingRedisPayload and save data to redis
     * @function setIndividualBiddingItemIdentity(identity,expiry,payload)
     */
    const individualBiddingRedisPayload = {
      lastBidTime: currentBidTime,
      lastBid: bid,
    };
    await setIndividualBiddingItemIdentity(
      individualBiddingIdentity,
      duration,
      individualBiddingRedisPayload,
    );
    /**
     * * send Success to client for success in placing bid
     */
    return Success(res, {
      message: 'Bid successful',
      result: {
        lastHeightBid: currentHeightBid,
        placesBid: bid,
      },
    });
  } catch (error: any) {
    error.origin = error.origin ? error.origin : BidControllerOrigin.bidItem;
    next(error);
  }
};
export const BidController = { bidItem };
