/**
 * * HTTP request logger. this logger will log every request ever made to your api
 * * with the time of the request, method, status, url, responseContentLength and responseTime
 * * this middleware is injected at the main app.js
 * * app.use(httpLogger)
 */
import morgan from 'morgan';
import { Logger } from '../loggers/logger';

const format = {
  method: ':method',
  url: ':url',
  status: ':status',
  resContentLength: ':res[content-length]',
  responseTime: ':response-time',
};

export const HttpLogger = morgan(JSON.stringify(format), {
  stream: {
    write: (message: string) => {
      const { method, url, status, resContentLength, responseTime } =
        JSON.parse(message);
      Logger.info('HTTP-Request-Log', {
        timestamp: new Date(),
        method,
        url,
        status: Number(status),
        responseTime: Number(responseTime),
        resContentLength,
      });
    },
  },
});
