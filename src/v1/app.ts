import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { AuthRoutes, UserRoutes } from './routes';
import { AppConfig } from './configs/app.config';
import { HttpLogger } from './loggers/httpLogger';
import { ErrorHandler } from './middlewares/errorHandler.middleware';
import { ErrorLogger } from './middlewares/errorLogger.middleware';
import { InvalidPath } from './middlewares/invalidPath.middleware';
import { InitiateRedisPluginConnection } from './plugins/redis.plugin';
import { InitiateMongoPluginConnection } from './plugins/mongo.plugin';

/**
 * * initiate express and express community middleware
 */
const { baseRoute } = AppConfig;
const app = express();
app.use(HttpLogger);
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(cors());
/**
 * * Connect to redis client
 */
InitiateRedisPluginConnection();
/**
 * * Connect to mongoDB client
 */
InitiateMongoPluginConnection();
/**
 * * A basic health check route above all the routes for checking if the application is running
 */
app.get(`${baseRoute}/health`, (req, res) => {
  res.status(200).json({
    message: 'Basic Health Check.',
    environment: process.env.NODE_ENV,
  });
});
/**
 * * Route injection to the app module
 */
app.use(`${baseRoute}/auth`, AuthRoutes);
app.use(`${baseRoute}/users`, UserRoutes);
/**
 * * Error logger middleware
 * * Error handler middleware
 * * Invalid Path middleware
 */
app.use(ErrorLogger);
app.use(ErrorHandler);
app.use(InvalidPath);

export const App = app;
