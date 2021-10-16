import { Context, Middleware } from 'koa';
import winston from 'winston';

import { config } from './config';

const { simple, colorize, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, namespace, timestamp }) => {
  return `${timestamp} [${namespace}] ${level}: ${message}`;
});

const simpleFormat = winston.format.combine(
  timestamp(),
  colorize(),
  simple(),
  myFormat
);

const jsonFormat = winston.format.combine(winston.format.json());

const transports = [
  new winston.transports.Console({
    level: config.logging.level,
    format: config.logging.json ? simpleFormat : jsonFormat,
  }),
];

export function logger(namespace: string): winston.Logger {
  return winston.createLogger({
    transports,
    defaultMeta: {
      namespace,
    },
  });
}

export function httpLogger(): Middleware {
  const httpLogger = logger('http');

  return async (ctx: Context, next: () => Promise<never>): Promise<void> => {
    const start = new Date().getTime();
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
    const ms = new Date().getTime() - start;

    let logLevel: string;
    if (ctx.status >= 500) {
      logLevel = 'error';
    } else if (ctx.status >= 400) {
      logLevel = 'warn';
    } else {
      logLevel = 'info';
    }

    const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

    httpLogger.log(logLevel, msg, {
      method: ctx.method,
      url: ctx.originalUrl,
      status: ctx.status,
      ip: ctx.ip,
      ms,
    });
  };
}
