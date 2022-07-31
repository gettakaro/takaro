/* import { Context, Middleware } from 'koa';
import winston from 'winston';

import { Config } from '../config';
import { IJsonMap } from '../type';

const config = new Config();

const { colorize, timestamp, printf, combine, json, errors } = winston.format;

const myFormat = printf((a) => {
  const { level, message, namespace, timestamp, error } = a;
  return `${timestamp} [${namespace}] ${level}: ${message} ${error ? error.stack : ''}`;
});

const simpleFormat = combine(errors({ stack: true }), timestamp(), colorize(), myFormat);

const jsonFormat = combine(json());

const transports = [
  new winston.transports.Console({
    level: config.get('logging.level'),
    format: config.get('logging.json') ? jsonFormat : simpleFormat
  })
];

const mainLogger = winston.createLogger({
  transports
});

export function logger(namespace: string, meta?: IJsonMap): winston.Logger {
  return mainLogger.child({ namespace, meta });
}

function logHttp(ctx: Context, start: Date) {
  const print = logger('http');
  const ms = new Date().getTime() - start.valueOf();

  let logLevel: string;
  if (ctx.status >= 500) {
    logLevel = 'error';
  } else if (ctx.status >= 400) {
    logLevel = 'warn';
  } else {
    logLevel = 'info';
  }

  const msg = `${ctx.method} ${ctx.status} ${decodeURIComponent(ctx.url)} ${ms}ms`;

  print.log(logLevel, msg, {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    ip: ctx.ip,
    ms,
    error: ctx.error,
    user: ctx.state.user?.id
  });
}

export function httpLogger(): Middleware {
  return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
    const start = new Date();

    try {
      await next();
    } catch (error) {
      logHttp(ctx, start);
      throw error;
    }

    logHttp(ctx, start);
  };
}
 */
