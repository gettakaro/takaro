import * as Sentry from '@sentry/node';
import { config } from './config.js';

Sentry.init({
  dsn: config.get('sentry.dsn'),
});

export * as Sentry from '@sentry/node';
