import { config } from './config';
import winston from 'winston';
import { JsonObject } from 'type-fest';

const { colorize, timestamp, printf, combine, json, errors } = winston.format;

config.validate();

const myFormat = printf((a) => {
  const { level, message, namespace, timestamp, error } = a;
  return `${timestamp} [${namespace}] ${level}: ${message} ${
    error ? error.stack : ''
  }`;
});

const simpleFormat = combine(
  errors({ stack: true }),
  timestamp(),
  colorize(),
  myFormat
);

const jsonFormat = combine(json());

const transports = [
  new winston.transports.Console({
    level: config.get('logging.level'),
    format: config.get('logging.json') ? jsonFormat : simpleFormat,
  }),
];

const mainLogger = winston.createLogger({
  transports,
});

export function logger(namespace: string, meta?: JsonObject): winston.Logger {
  return mainLogger.child({ namespace, meta });
}
