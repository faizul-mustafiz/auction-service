import * as dotenv from 'dotenv';
dotenv.config();

export default {
  //app environment variables
  API_PROTOCOL: process.env.API_PROTOCOL,
  API_HOST: process.env.API_HOST,
  API_PORT: process.env.API_PORT,
  BASE_API_ROUTE: process.env.BASE_API_ROUTE,

  // redis environments variables
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  // mongo environment variables
  MONGO_URL: process.env.MONGO_URL,
  MONGO_USERNAME: process.env.MONGO_USERNAME,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  // hashing algorithm for encryption
  HASHING_ALGORITHM: process.env.HASHING_ALGORITHM,
  // JWT environment variables
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY_TIME: process.env.ACCESS_TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY_TIME: process.env.REFRESH_TOKEN_EXPIRY_TIME,
  VERIFY_TOKEN_SECRET: process.env.VERIFY_TOKEN_SECRET,
  VERIFY_TOKEN_EXPIRY_TIME: process.env.VERIFY_TOKEN_EXPIRY_TIME,
  RESET_PASSWORD_TOKEN_SECRET: process.env.RESET_PASSWORD_TOKEN_SECRET,
  RESET_PASSWORD_TOKEN_EXPIRY_TIME:
    process.env.RESET_PASSWORD_TOKEN_EXPIRY_TIME,
  CHANGE_PASSWORD_TOKEN_SECRET: process.env.CHANGE_PASSWORD_TOKEN_SECRET,
  CHANGE_PASSWORD_TOKEN_EXPIRY_TIME:
    process.env.CHANGE_PASSWORD_TOKEN_EXPIRY_TIME,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
};
