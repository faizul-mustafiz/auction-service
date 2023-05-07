import { NextFunction, Request, Response } from 'express';
import { BidControllerOrigin } from '../enums/bidControllerOrigin.enum';
import { Item } from '../models/item.model';
import { Bid } from '../models/bid.model';
import { NotFoundError } from '../errors/NotFoundError';
import {
  setIndividualBiddingItemIdentity,
  setOngoingBiddingItemIdentity,
} from '../helpers/redis.helper';
import { Created } from '../reponses/httpResponse';
import { Logger } from '../loggers/logger';
import { BidInterface } from '../interfaces/bid.interface';
import { ItemDocumentChangesInterface } from '../interfaces/itemDocumentChanges.interface';
import { OngoingBiddingRedisPayloadInterface } from '../interfaces/ongoingBiddingRedisPayload.interface';
import { IndividualBiddingRedisPayloadInterface } from '../interfaces/individualBiddingRedisPayloadInterface.interface';
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
    const itemDocumentChanges: ItemDocumentChangesInterface = {
      currentHighestBid: Number(bid),
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
    const bidObject: BidInterface = {
      userId: id,
      itemId: itemId,
      heightBid: bid,
    };
    const newBid = new Bid(bidObject);
    const bidResult: any = await newBid.save();
    Logger.debug('bidResult', bidResult);
    /**
     * * generate ongoingBiddingRedisPayload and save data to redis
     * @function setOngoingBiddingItemIdentity(identity,expiry,payload)
     */
    const ongoingBiddingRedisPayload: OngoingBiddingRedisPayloadInterface = {
      currentHeightBid: Number(bid),
      windowEndTime: Number(windowEndTime),
    };
    await setOngoingBiddingItemIdentity(
      itemId,
      windowEndTime,
      ongoingBiddingRedisPayload,
    );
    /**
     * * generate individualBiddingRedisPayload and save data to redis
     * @function setIndividualBiddingItemIdentity(identity,expiry,payload)
     */
    const individualBiddingRedisPayload: IndividualBiddingRedisPayloadInterface =
      {
        lastBidTime: Number(currentBidTime),
        lastBid: Number(bid),
      };
    await setIndividualBiddingItemIdentity(
      individualBiddingIdentity,
      windowEndTime,
      individualBiddingRedisPayload,
    );
    /**
     * * send Created to client for success in placing bid
     */
    return Created(res, {
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
