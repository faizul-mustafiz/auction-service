import dotenv from 'dotenv';
dotenv.config();

import { Logger } from '../loggers/logger';

import { MongoError } from 'mongodb';
import { MongoConfig } from '../configs/mongo.config';
const { config, options } = MongoConfig;
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

/**
 * * mongoClient onConnected callback function
 */
const mongoConnectCallback = () => {
  Logger.debug('mongo-connect-callback: %s', 'mongoDB is connected');
};
/**
 * * mongoClient onError callback function
 * * onError event close the connection and exit the process in exitCode = 0
 */
const mongoErrorCallback = (error: MongoError) => {
  Logger.error('mongo-error:-callback-error', error);
  mongoose.connection.close();
  Logger.debug('Disconnected form mongo agent-stack: %s', error);
  process.exit(0);
};
/**
 * * mongoClient onDisconnected callback function
 */
const mongoDisconnectCallback = () => {
  Logger.debug('mongo-disconnect-callback: %s', 'mongoDB is disconnected');
};

/**
 * * connect to mongoClient
 */

export const InitiateMongoPluginConnection = () => {
  mongoose.connect(config.url, options);
  mongoose.Promise = global.Promise;
  /**
   * * mongoClient onConnected and onError event handler
   */
  mongoose.connection.on('connected', () => mongoConnectCallback());
  mongoose.connection.on('error', (error) => mongoErrorCallback(error));
  mongoose.connection.on('disconnected', () => mongoDisconnectCallback());
};

/**
 * * this method is for closing mongoClient connection for graceful server shutdown
 */
export const CloseMongoPluginConnection = () => {
  mongoose.connection.close(false);
  Logger.debug('Closing mongo plugin connection...');
};

export const MongoPlugin = mongoose;
