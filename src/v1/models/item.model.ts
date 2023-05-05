import { Schema, model } from 'mongoose';
import { ItemInterface } from '../interfaces/item.interface';
import { ItemModel } from '../interfaces/itemModel.interface';

const itemSchema = new Schema<ItemInterface, ItemModel>(
  {
    name: {
      type: String,
      index: true,
      trim: true,
      require: true,
    },
    startingPrice: {
      type: Number,
      require: true,
    },
    duration: {
      type: Number,
    },
    currentHighestBid: {
      type: Number,
    },
    windowStartTime: {
      type: Number,
    },
    windowEndTime: {
      type: Number,
    },
    isPublished: {
      type: Boolean,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    createdBy: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: '_version',
  },
);

/**
 * * check if a item name exists in the db
 * @function nameExist(name)
 * @param name
 * @returns item document
 */
itemSchema.static('nameExist', function (name: string) {
  return this.findOne({ name: name });
});

export const Item = model<ItemInterface, ItemModel>('Item', itemSchema);
