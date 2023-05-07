import { createClient } from 'redis';
import { RedisConfig } from '../configs/redis.config';
import { Logger } from '../loggers/logger';
import { completeBiddingItemAfterDurationExpired } from '../helpers/bid.helper';

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
 * * create subscriber redisClient with redisLabs connection string url imported from the redisConfig
 */
const subscriberClient = redisClient.duplicate();
/**
 * * redis subscriberClient onConnect callback function
 */
const subscriberClientConnectCallback = () => {
  Logger.debug(
    'redis-subscriber-client-connect-callback-response: %s',
    'Connection to redis successful',
  );
};
/**
 * * redis subscriberClient onError callback function
 * * onError event close the connection and exit the process in exitCode = 0
 */
const subscriberClientErrorCallback = (error: any) => {
  Logger.error('redis-subscriber-client-error-callback-error:', error);
  subscriberClient.disconnect();
  process.exit(0);
};

/**
 * * connect to redis client
 */
export const InitiateRedisPluginConnection = () => {
  redisClient.connect();
  subscriberClient.connect();
  /**
   * * redisClient onConnect and onError event handler
   */
  redisClient.on('connect', redisConnectCallback);
  redisClient.on('error', redisErrorCallback);

  /**
   * * redis subscriberClient onConnect and onError event handler
   */
  subscriberClient.on('connect', subscriberClientConnectCallback);
  subscriberClient.on('error', subscriberClientErrorCallback);
};
/**
 * * subscribe to expired event of keys
 */
export const SubscribeToRedisKeyExpiredEvent = () => {
  subscriberClient.pSubscribe('*:expired', (expiredKey: string) => {
    Logger.debug('expiredKeys: %s', expiredKey);
    if (expiredKey.includes('ob:')) {
      Logger.debug('ongoing-bidding-key-expired: %s', expiredKey);
      completeBiddingItemAfterDurationExpired(expiredKey);
    }
  });
};
/**
 * * this method is for closing redisClient connection for graceful server shutdown
 */
export const CloseRedisPluginConnection = () => {
  Logger.debug('Closing redis plugin connection...');
  redisClient.disconnect();
  subscriberClient.pUnsubscribe('*:expired');
  subscriberClient.disconnect();
};

export const RedisClient = redisClient;
