/**
 * * During the test we are going to use test environment config
 * * as mongo will use auction_test db and redis will use test db.
 * * for local redis use redis db index 15
 * @example redis://redis:6379/15
 * * please set the test env variable pointing to your test db connection string
 * * MONGO_URL_TEST and REDIS_URL_TEST
 */
process.env.NODE_ENV = 'testing';

import * as AuthTest from './auth.spec';
import * as UserTest from './user.spec';
import * as ItemTest from './item.spec';

export { AuthTest, UserTest, ItemTest };
