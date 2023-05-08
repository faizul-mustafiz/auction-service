import * as dotenv from 'dotenv';
dotenv.config();

export const environment = {
  //app environment variables
  API_PROTOCOL: process.env.API_PROTOCOL as string,
  API_HOST: process.env.API_HOST as string,
  API_PORT: process.env.API_PORT as string,
  BASE_API_ROUTE: process.env.BASE_API_ROUTE as string,
  //bidding environment variables
  BIDDING_INTERVAL: process.env.BIDDING_INTERVAL as string,
  // redis environments variables
  REDIS_URL: process.env.REDIS_URL as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: process.env.REDIS_PORT as string,
  REDIS_USERNAME: process.env.REDIS_USERNAME as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  // mongo environment variables
  MONGO_URL: process.env.MONGO_URL as string,
  MONGO_USERNAME: process.env.MONGO_USERNAME as string,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD as string,
  // hashing algorithm for encryption
  HASHING_ALGORITHM: process.env.HASHING_ALGORITHM as string,
  // JWT environment variables
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRY_TIME: process.env.ACCESS_TOKEN_EXPIRY_TIME as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  REFRESH_TOKEN_EXPIRY_TIME: process.env.REFRESH_TOKEN_EXPIRY_TIME as string,
  VERIFY_TOKEN_SECRET: process.env.VERIFY_TOKEN_SECRET as string,
  VERIFY_TOKEN_EXPIRY_TIME: process.env.VERIFY_TOKEN_EXPIRY_TIME as string,
  RESET_PASSWORD_TOKEN_SECRET: process.env
    .RESET_PASSWORD_TOKEN_SECRET as string,
  RESET_PASSWORD_TOKEN_EXPIRY_TIME: process.env
    .RESET_PASSWORD_TOKEN_EXPIRY_TIME as string,
  CHANGE_PASSWORD_TOKEN_SECRET: process.env
    .CHANGE_PASSWORD_TOKEN_SECRET as string,
  CHANGE_PASSWORD_TOKEN_EXPIRY_TIME: process.env
    .CHANGE_PASSWORD_TOKEN_EXPIRY_TIME as string,
  PUBLIC_KEY: process.env.PUBLIC_KEY as string,
  PRIVATE_KEY: process.env.PRIVATE_KEY as string,
};
