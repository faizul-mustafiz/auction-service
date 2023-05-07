import { Router } from 'express';
import { BidController } from '../controllers';
import { HasAuthorization } from '../middlewares/hasAuthorization.middleware';
import { ValidateAccess } from '../middlewares/validateAccess.middleware';
import { ValidateBidRequestBody } from '../middlewares/validateBidRequestBody.middleware';
import { ValidateBid } from '../middlewares/ValidateBid.middleware';
import { ValidateIndividualBid } from '../middlewares/validateIndividualBid.middleware';

const bidRouter = Router();
bidRouter.post(
  '/:itemId',
  [
    HasAuthorization,
    ValidateAccess,
    ValidateBidRequestBody,
    ValidateBid,
    ValidateIndividualBid,
  ],
  BidController.bidItem,
);

export const BidRouter = bidRouter;
