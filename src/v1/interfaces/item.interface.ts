export interface ItemInterface {
  name: string;
  startingPrice: number;
  duration: number;
  currentHighestBid?: number;
  windowStartTime?: number;
  windowEndTime?: number;
  isPublished: boolean;
  status: string;
  createdBy: string;
}
