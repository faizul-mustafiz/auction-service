import { HydratedDocument, Model } from 'mongoose';
import { UserInterface } from './user.interface';
import { UserMethods } from './userMethods.interface';

export interface UserModel extends Model<UserInterface, {}, UserMethods> {
  generateHash(password: string): string;
  emailExist(
    email: string,
  ): Promise<HydratedDocument<UserInterface, UserMethods>>;
}
