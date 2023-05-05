import { Schema, model } from 'mongoose';
import { hashSync, compareSync, genSaltSync } from 'bcryptjs';
import { UserInterface } from '../interfaces/user.interface';
import { UserModel } from '../interfaces/userModel.interface';
import { UserMethods } from '../interfaces/userMethods.interface';

const userSchema = new Schema<UserInterface, UserModel, UserMethods>(
  {
    email: {
      type: String,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      index: true,
    },
    avatar: {
      type: String,
    },
    mobile: {
      type: String,
    },
    dob: {
      type: Date,
    },
    organization: {
      type: String,
    },
    isLoggedIn: {
      type: Boolean,
    },
    isVerified: {
      type: Boolean,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: '_version',
  },
);

/**
 * * generating a hash
 * @function generateHash(password)
 * @param password
 * @returns encrypted hashed password string
 */
userSchema.static('generateHash', function (password: string) {
  return hashSync(password, genSaltSync(10));
});

/**
 * * checking if password is valid
 * @function validatePassword(password)
 * @param password
 * @returns boolean
 */
userSchema.method('validatePassword', function (password: any): boolean {
  return compareSync(password, this.password);
});

/**
 * * check if a email exists in the db
 * @function emailExist(email)
 * @param email
 * @returns user document
 */
userSchema.static('emailExist', function (email: string) {
  return this.findOne({ email });
});

/**
 * delete these object keys before returning the db document to consumer
 * @returns user document with deleted keys
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.isLoggedIn;
  delete obj.isVerified;
  return obj;
};

export const User = model<UserInterface, UserModel>('User', userSchema);
