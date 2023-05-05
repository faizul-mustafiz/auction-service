import { HydratedDocument, Model } from 'mongoose';
import { ItemInterface } from './item.interface';

export interface ItemModel extends Model<ItemInterface> {
  nameExist(name: string): Promise<HydratedDocument<ItemInterface>>;
}
