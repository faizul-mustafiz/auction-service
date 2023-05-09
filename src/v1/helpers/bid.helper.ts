import { ItemStatus } from '../enums/itemStatus.enum';
import { Logger } from '../loggers/logger';
import { Item } from '../models/item.model';
import { User } from '../models/user.model';
import { extractItemIdFromBiddingKey } from '../utility/item.utility';

export const completeBiddingItemAfterDurationExpired = async (
  biddingKey: string,
) => {
  try {
    Logger.debug('complete-bidding-item-biddingKey: %s', biddingKey);
    const itemId = extractItemIdFromBiddingKey(biddingKey);
    Logger.debug('complete-bidding-item-itemId: %s', itemId);
    const completingBiddingItem = await Item.findOne({ _id: itemId });
    Logger.debug(
      'complete-bidding-item--completingBiddingItem: %s',
      completingBiddingItem,
    );
    if (!completingBiddingItem) {
      Logger.error(
        'completing-bidding-item-not-found',
        'The item to complete bidding not found',
      );
      return;
    }
    const { status, currentHighestBid, currentHighestBidder } =
      completingBiddingItem;

    /**
     * * get user details from user collection and make the current height bid
     * * amount deduction from user balance.
     */
    const user = await User.findOne({ _id: currentHighestBidder });
    Logger.debug('complete-bidding-item-user: %s', user);
    if (!user) {
      Logger.error(
        'completing-bidding-item-user-not-found',
        'User info for height bidder not found',
      );
      return;
    }
    const userChanges = {
      balance: user.balance - currentHighestBid,
    };
    const updatedUser = Object.assign(user, userChanges);
    const userSaveResult = await updatedUser.save();

    /**
     * * check if item status is already complete if not then update item
     * * status to complete
     */
    if (status === ItemStatus.completed) {
      Logger.error(
        'item-status-already-completed',
        'This item bidding is already completed',
      );
      return;
    }
    const itemChanges = {
      status: ItemStatus.completed,
    };
    /**
     * * save item and user changes to db
     */
    Logger.debug('item-bidding-compete-userSaveResult: %s', userSaveResult);
    Logger.info(
      'item-bidding-compete-user-info-updated: %s',
      'Successfully adjusted user balance after bidding compete',
    );
    const updatedItem = Object.assign(completingBiddingItem, itemChanges);
    const itemSaveResult = await updatedItem.save();
    Logger.debug('item-bidding-compete-itemSaveResult: %s', itemSaveResult);
    Logger.info(
      'item-bidding-compete-success: %s',
      'Successfully made bidding complete after time window expired',
    );
    return {
      success: true,
      message:
        'Successfully made bidding complete after time window expired and height bid is deducted from user balance',
      itemId: itemId,
      userId: user.id,
    };
  } catch (error: any) {
    Logger.error('complete-bidding-item-base-error', error);
  }
};
