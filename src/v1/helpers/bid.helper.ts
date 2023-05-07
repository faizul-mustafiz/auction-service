import { ItemStatus } from '../enums/itemStatus.enum';
import { Logger } from '../loggers/logger';
import { Item } from '../models/item.model';
import { extractItemIdFromBiddingKey } from '../utility/item.utility';

export const completeBiddingItemAfterDurationExpired = async (
  biddingKey: string,
) => {
  try {
    Logger.debug('biddingKey: %s', biddingKey);
    const itemId = extractItemIdFromBiddingKey(biddingKey);
    Logger.debug('itemId: %s', itemId);
    const completingBiddingItem = await Item.findOne({ _id: itemId });
    Logger.debug('completingBiddingItem: %s', completingBiddingItem);
    if (!completingBiddingItem) {
      Logger.error(
        'completing-bidding-item-not-found',
        'The item to complete bidding not found',
      );
      return;
    }
    const { status } = completingBiddingItem;
    if (status === ItemStatus.completed) {
      Logger.error(
        'item-status-already-completed',
        'This item bidding is already completed',
      );
      return;
    }
    const changes = {
      status: ItemStatus.completed,
    };
    const updatedItem = Object.assign(completingBiddingItem, changes);
    const result = await updatedItem.save();
    Logger.info(
      'item-bidding-compete-success',
      'Successfully made bidding complete after time window expired',
    );
    return result;
  } catch (error: any) {
    Logger.error('completeBiddingItemAfterDurationExpired-base-error', error);
  }
};
