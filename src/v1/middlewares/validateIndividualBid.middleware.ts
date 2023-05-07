import { NextFunction, Request, Response } from 'express';
import { Logger } from '../loggers/logger';
import { BadRequestError } from '../errors/BadRequestError';
import {
  getIndividualBiddingItemIdentity,
  getOngoingBiddingItemIdentity,
  isIndividualBiddingItemIdentityExists,
  isOngoingBiddingItemIdentityExists,
} from '../helpers/redis.helper';
import moment from 'moment';
import { User } from '../models/user.model';
import { NotFoundError } from '../errors/NotFoundError';

export const ValidateIndividualBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * * get user id from res.locals.validateAccessResponse
     */
    const { id } = res.locals.validateAccessResponse;
    Logger.debug('user-id', id);
    /**
     * * get bid amount form request body
     */
    const { bid } = req.body;
    Logger.debug('bid-amount', bid);
    /**
     * * get user document using id form res.locals.validateAccessResponse
     * * if user does not exists then send NotFoundError
     * @function NotFoundError(origin,message)
     */
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new NotFoundError(
        'ValidateIndividualBid-no-user-with-provided-id',
        'No document found by this id',
      );
    }
    /**
     * * check if the bid amount is greater then user available balance
     * * if true then send BadRequestError
     * @function BadRequestError(origin,message)
     */
    if (bid > user.balance) {
      throw new BadRequestError(
        'ValidateIndividualBid-bid-amount-is-higher-then-user-balance',
        `Bid $${bid} is higher then user available balance $${user.balance}. Please deposit money to place bid`,
      );
    }
    /**
     * * get item_id form request params
     */
    const { itemId } = req.params;
    Logger.debug('itemId', itemId);
    /**
     * * generate individual bidding identity and get redis payload
     * * against that identity
     */
    const individualBiddingIdentity = `${itemId}:${id}`;
    const individualBiddingRedisResponse: any =
      await getIndividualBiddingItemIdentity(individualBiddingIdentity);
    Logger.debug(
      'individualBiddingRedisResponse',
      individualBiddingRedisResponse,
    );
    /**
     * * check if there is any result against the individualBiddingIdentity
     * * if there is no result then this is a first bid
     * * if there is result then check if lastBiddingInterval is less then biddingInterval config variable
     */
    const currentBidTime = moment().unix();
    if (Object.keys(individualBiddingRedisResponse).length !== 0) {
      const { lastBidTime } = individualBiddingRedisResponse;
      console.log('lastBidTime', lastBidTime);
      const actualBidInterval = currentBidTime - lastBidTime;
      console.log('actualBidInterval', actualBidInterval);
      if (actualBidInterval <= 20) {
        throw new BadRequestError(
          'ValidateIndividualBid-bidding-interval-not-passed-error',
          'You need to wait 5sec for your next bid',
        );
      }
    }
    /**
     * * attach individualBiddingIdentity and currentBidTime in the res.locals.validatedOngoingBiddingInfo
     */
    res.locals.validatedOngoingBiddingInfo = {
      ...res.locals.validatedOngoingBiddingInfo,
      individualBiddingIdentity,
      currentBidTime,
    };
    Logger.debug(
      'validatedOngoingBiddingInfo',
      res.locals.validatedOngoingBiddingInfo,
    );
    next();
  } catch (error: any) {
    error.origin = error.origin
      ? error.origin
      : 'ValidateIndividualBid-base-error:';
    next(error);
  }
};
