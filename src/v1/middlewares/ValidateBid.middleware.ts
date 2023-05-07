import { NextFunction, Request, Response } from 'express';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';
import {
  getOngoingBiddingItemIdentity,
  isOngoingBiddingItemIdentityExists,
} from '../helpers/redis.helper';
import { OngoingBiddingRedisPayloadInterface } from '../interfaces/ongoingBiddingRedisPayload.interface';

export const ValidateBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get item_id form request params
     */
    const { itemId } = req.params;
    Logger.debug('itemId', itemId);
    /**
     * * get bid amount form request body
     */
    const { bid } = req.body;
    Logger.debug('bid-amount', bid);

    /**
     * * check if item is an ongoing bidding item and if not then send BadRequestError
     * @function isOngoingBiddingItemIdentityExists(itemId)
     * @returns boolean
     * @function BadRequestError(origin,message)
     */
    const ongoingBiddingIdentityExists =
      await isOngoingBiddingItemIdentityExists(itemId);
    if (!ongoingBiddingIdentityExists) {
      throw new BadRequestError(
        'ValidateBid-ongoing-bidding-item-identity-does-not-exists',
        'Invalid item or the bidding has ended',
      );
    }
    /**
     * * get redis payload for the ongoing bidding item using ob:item_id key
     * @function getOngoingBiddingItemIdentity(itemId)
     */
    const ongoingBiddingRedisResponse: any =
      await getOngoingBiddingItemIdentity(itemId);
    const { currentHeightBid, windowEndTime } = ongoingBiddingRedisResponse;
    /**
     * * check if the requested {bid} is less or equal then the existing currentHeightBid
     * * if true then send BadRequestError
     * @function BadRequestError(origin,message)
     */
    if (bid <= currentHeightBid) {
      throw new BadRequestError(
        'ValidateBid-bid-amount-is-less-then-current-height-bid',
        'Bid amount is less then current height bid',
      );
    }
    /**
     * * pass { currentHeightBid, windowEndTime } in the res.locals.validatedOngoingBiddingInfo
     * * this value will be used in the next middleware chain
     */
    const validatedOngoingBiddingInfo: OngoingBiddingRedisPayloadInterface = {
      currentHeightBid: Number(currentHeightBid),
      windowEndTime: Number(windowEndTime),
    };
    Logger.debug(
      'ValidateBid-validatedOngoingBiddingInfo',
      validatedOngoingBiddingInfo,
    );
    res.locals.validatedOngoingBiddingInfo = validatedOngoingBiddingInfo;
    next();
  } catch (error: any) {
    error.origin = error.origin ? error.origin : 'ValidateBid-base-error:';
    next(error);
  }
};
