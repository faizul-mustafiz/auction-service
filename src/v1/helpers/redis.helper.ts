import { Logger } from '../loggers/logger';
import { RedisClient } from '../plugins/redis.plugin';

/**
 * * generic reusable methods for tokens
 */
export const isIdentityExists = async (identity: string) => {
  try {
    let result = await RedisClient.exists(identity);
    Logger.debug('isIdentityExists-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('isIdentityExists-error:', error);
  }
};
/**
 * * string store related methods
 */
export const setIdentity = async (
  identity: string,
  expiry: number,
  payload: any,
) => {
  try {
    let result = await RedisClient.set(identity, payload);
    await RedisClient.expireAt(identity, expiry);
    Logger.debug('setIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('setIdentity-error:', error);
  }
};
export const setIdentityWithNoExpiry = async (
  identity: string,
  payload: any,
) => {
  try {
    let result = await RedisClient.set(identity, payload);
    Logger.debug('setIdentityWithNoExpiry-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('setIdentityWithNoExpiry-error:', error);
  }
};
export const getIdentityPayload = async (identity: string) => {
  try {
    let result = await RedisClient.get(identity);
    Logger.debug('getIdentityPayload-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('getIdentityPayload-error:', error);
  }
};
/**
 * * hash map store related methods
 */
export const setIdentityWithHSet = async (
  identity: string,
  expiry: number,
  payload: any,
) => {
  try {
    let result = await RedisClient.hSet(identity, payload);
    await RedisClient.expireAt(identity, expiry);
    Logger.debug('setIdentityWithHSet-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('setIdentityWithHSet-error:', error);
  }
};
export const setIdentityWithHSetNoExpiry = async (
  identity: string,
  payload: any,
) => {
  try {
    let result = await RedisClient.hSet(identity, payload);
    Logger.debug('setIdentityWithHSetNoExpiry-result: %s', result);
  } catch (error) {
    Logger.error('setIdentityWithHSetNoExpiry-error:', error);
  }
};
export const getHSetIdentityPayload = async (identity: string) => {
  try {
    let result = await RedisClient.hGetAll(identity);
    Logger.debug('getIdentityPayload-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('getHSetIdentityPayload-error:', error);
  }
};
export const deleteIdentity = async (identity: string) => {
  try {
    let result = await RedisClient.del(identity);
    Logger.debug('deleteIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('deleteIdentity-error:', error);
  }
};

/**
 * * access and refresh token identity blacklist related methods
 */
export const isIdentityBlacklisted = async (identity: string) => {
  try {
    let result = await isIdentityExists(`bl:${identity}`);
    Logger.debug('isIdentityBlacklisted-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('isIdentityBlacklisted-error:', error);
  }
};
export const setIdentityToBlacklist = async (
  identity: string,
  expiry: number,
) => {
  try {
    const result = await setIdentity(`bl:${identity}`, expiry, '');
    Logger.debug('setIdentityToBlacklist-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('setIdentityToBlacklist-error:', error);
  }
};
export const deleteBlacklistedIdentity = async (identity: string) => {
  try {
    let result = await deleteIdentity(`bl:${identity}`);
    Logger.debug('deleteBlacklistedIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('deleteBlacklistedIdentity-error:', error);
  }
};

/**
 * * verify token related methods
 */
export const isVerifyTokenIdentityExists = async (identity: string) => {
  try {
    const result = await isIdentityExists(`v:${identity}`);
    Logger.debug('isVerifyTokenIdentityExists-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('isVerifyTokenIdentityExists-error:', error);
  }
};
export const setVerifyTokenIdentity = async (
  identity: string,
  expiry: number,
  payload: any,
) => {
  try {
    const result = await setIdentityWithHSet(`v:${identity}`, expiry, payload);
    Logger.debug('setVerifyTokenIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('setVerifyTokenIdentity-error:', error);
  }
};
export const getVerifyTokenIdentity = async (identity: string) => {
  try {
    let result = await getHSetIdentityPayload(`v:${identity}`);
    Logger.debug('getTokenPayload-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('getVerifyTokenIdentity-error:', error);
  }
};
export const deleteVerifyTokenIdentity = async (identity: string) => {
  try {
    const result = await deleteIdentity(`v:${identity}`);
    Logger.debug('deleteVerifyTokenIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('deleteVerifyTokenIdentity-error:', error);
  }
};

/**
 * * changePassword token related methods
 */
export const isChangePasswordTokenIdentityExists = async (identity: string) => {
  try {
    const result = await isIdentityExists(`cp:${identity}`);
    Logger.debug('isChangePasswordTokenIdentityExists-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('isChangePasswordTokenIdentityExists-error:', error);
  }
};
export const setChangePasswordTokenIdentity = async (
  identity: string,
  expiry: number,
  payload: any,
) => {
  try {
    const result = await setIdentityWithHSet(`cp:${identity}`, expiry, payload);
    Logger.debug('saveChangePasswordTokenIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('saveChangePasswordTokenIdentity-error:', error);
  }
};
export const getChangePasswordTokenIdentity = async (identity: string) => {
  try {
    let result = await getHSetIdentityPayload(`cp:${identity}`);
    Logger.debug('getChangePasswordTokenIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('getChangePasswordTokenIdentity-error:', error);
  }
};
export const deleteChangePasswordTokenIdentity = async (identity: string) => {
  try {
    const result = await deleteIdentity(`cp:${identity}`);
    Logger.debug('deleteChangePasswordTokenIdentity-result: %s', result);
    return result;
  } catch (error) {
    Logger.error('deleteChangePasswordTokenIdentity-error:', error);
  }
};

/**
 * * clean up redis db related method
 */
export const deleteDataFromRedis = async () => {
  try {
    const result = await RedisClient.flushDb();
    Logger.debug('deleteDataFromRedis-result: %s', result);
  } catch (error) {
    Logger.error('deleteDataFromRedis-error', error);
  }
};
