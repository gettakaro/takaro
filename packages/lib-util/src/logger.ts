import { config } from './config';
import winston from 'winston';
import { JsonObject } from 'type-fest';
import { omit } from 'lodash';

const { colorize, timestamp, printf, combine, json, errors } = winston.format;

config.validate();

const myFormat = printf((info) => {
  const { level, message, namespace, timestamp } = info;
  const cleanMeta = omit(
    info,
    'level',
    'message',
    'namespace',
    'timestamp',
    'service',
    'labels'
  );

  let metaString = '';

  try {
    metaString = `| ${JSON.stringify(
      cleanMeta,
      Object.getOwnPropertyNames(cleanMeta)
    )}`;
  } catch (e) {
    metaString = '| Invalid Meta Information';
  }

  const paddedNamespace = `[${namespace}]`.padEnd(10);

  if (config.get('logging.minimal')) {
    return `${paddedNamespace} ${level} ${message}`;
  }

  return `${timestamp} ${paddedNamespace} ${level}: ${message} ${
    metaString ? metaString : ''
  }`;
});

const simpleFormat = combine(
  errors({ stack: true }),
  timestamp(),
  colorize(),
  myFormat
);

const jsonFormat = combine(json());

let level = config.get('logging.level');

if (config.get('mode') === 'test' && process.env.LOGGING_LEVEL === undefined) {
  level = 'none';
}

const transports = [
  new winston.transports.Console({
    level: level,
    format: config.get('logging.json') ? jsonFormat : simpleFormat,
    silent: level === 'none',
  }),
];

const mainLogger = winston.createLogger({
  transports,
});

export function logger(namespace: string, meta?: JsonObject): winston.Logger {
  return mainLogger.child({ namespace, meta });
}
