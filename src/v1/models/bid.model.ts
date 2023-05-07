import { Schema, model } from 'mongoose';

const bidSchema = new Schema(
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

export const Bid = model('Bid', bidSchema);
