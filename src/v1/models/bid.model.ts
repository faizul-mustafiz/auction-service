import { Schema, model } from 'mongoose';
import { BidInterface } from '../interfaces/bid.interface';

const bidSchema = new Schema<BidInterface>(
  {
    userId: {
      type: String,
      index: true,
      require: true,
    },
    itemId: {
      type: String,
      index: true,
      require: true,
    },
    heightBid: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: '_version',
  },
);

export const Bid = model<BidInterface>('Bid', bidSchema);
