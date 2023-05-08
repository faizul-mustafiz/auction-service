import { environment } from '../environments/index';
const { BIDDING_INTERVAL } = environment;

export const BiddingConfig = {
  biddingInterval: Number(BIDDING_INTERVAL),
};
