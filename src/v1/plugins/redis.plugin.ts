import { createClient } from 'redis';
import { RedisConfig } from '../configs/redis.config';
import { Logger } from '../loggers/logger';

/**
 * * create redisClient with redisLabs connection string url imported from the redisConfig
 */
const redisClient = createClient({
  url: RedisConfig.url,
});
/**
 * * redisClient onConnect callback function
 */
const redisConnectCallback = () => {
  Logger.debug(
    'redis-connect-callback-response: %s',
    'Connection to redis successful',
  );
};
/**
 * * redisClient onError callback function
 * * onError event close the connection and exit the process in exitCode = 0
 */
const redisErrorCallback = (error: any) => {
  Logger.error('redis-error-callback-error:', error);
  redisClient.disconnect();
  process.exit(0);
};
/**
 * * connect to redis client
 */
export const InitiateRedisPluginConnection = () => {
  redisClient.connect();
  /**
   * * redisClient onConnect and onError event handler
   */
  redisClient.on('connect', redisConnectCallback);
  redisClient.on('error', redisErrorCallback);
};
/**
 * * this method is for closing redisClient connection for graceful server shutdown
 */
export const CloseRedisPluginConnection = () => {
  Logger.debug('Closing redis plugin connection...');
  redisClient.disconnect();
};

export const RedisClient = redisClient;
