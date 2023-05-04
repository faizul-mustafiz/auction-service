import { App } from './src/v1/app';
import { AppConfig } from './src/v1/configs/app.config';
import { Logger } from './src/v1/loggers/logger';
import { CloseMongoPluginConnection } from './src/v1/plugins/mongo.plugin';
import { CloseRedisPluginConnection } from './src/v1/plugins/redis.plugin';
const { port, host } = AppConfig;

/**
 * * create express server with port and host imported form app.config
 */
const server = App.listen(Number(port), host, () => {
  Logger.debug('Express is running on →');
  console.table({
    host: host,
    port: port,
  });
});

/**
 * * this method is for gracefully closing the express server(node.js process)
 * @function graceFullyCloseServerAndPluginConnections(exitCode)
 * * this function will first close the http server and then close mogoDB and redis plugin connection
 * * and then proceed with process.exit(exitCode)
 */
const graceFullyCloseServerAndPluginConnections = (exitCode: number) => {
  server.close(() => {
    Logger.debug('Closing the Server...');
    CloseMongoPluginConnection();
    CloseRedisPluginConnection();
    Logger.debug(`Closing the main process with exitCode: ${exitCode}`);
    process.exit(exitCode);
  });
};
/**
 * * This event is emitted when there is any uncaughtException in the code.
 * * this will log the uncaughtException error in the error logger and proceed to
 * *  process.exit with exitCode = 1. Which means the process exited with error
 */
process.on('uncaughtException', (error) => {
  Logger.error('uncaughtException-error:', error);
  process.exit(1);
});
/**
 * * This event is emitted when there is any unhandledRejection in the code.
 * * this will log the unhandledRejection error in the error logger and proceed to
 * *  process.exit with exitCode = 1. Which means the process exited with error
 */
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('unhandledRejection-at %s, %s', promise, `reason: ${reason}`);
  process.exit(1);
});
/**
 * * on these events like SIGINT, SIGUSR1, SIGUSR2, SIGTERM this will also proceed to
 * * graceFullyCloseServerAndPluginConnections with exitCode = 0. Which means the process exited without error
 * @function graceFullyCloseServerAndPluginConnections(exitCode)
 */
[`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((event) => {
  process.on(event, () => {
    Logger.debug('Process event type: %s', event);
    graceFullyCloseServerAndPluginConnections(0);
  });
});
/**
 * * logs the beforeExit event log
 */
process.on('beforeExit', (code) => {
  Logger.debug(`Process beforeExit event with code: ${code}`);
});
/**
 * * logs the exit event log
 */
process.on('exit', (code) => {
  Logger.debug(`Process exit event with code: ${code}`);
});

export const Server = App;
