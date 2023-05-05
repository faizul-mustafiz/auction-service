import moment from 'moment';
import { ItemStatus } from '../enums/itemStatus.enum';

export const generatePublishItemChanges = (duration: number) => {
  const currentRequestTime = moment();
  const windowStartTime = moment().unix();
  const windowEndTime = currentRequestTime.add(duration, 'hours').unix();
  return {
    isPublished: true,
    status: ItemStatus.ongoing,
    windowStartTime: windowStartTime,
    windowEndTime: windowEndTime,
  };
};
