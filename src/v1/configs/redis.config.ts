import { environment } from '../environments/index';

const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = environment;

export const RedisConfig = {
  url: REDIS_URL,
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
};
