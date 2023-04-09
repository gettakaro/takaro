import * as Sentry from '@sentry/node';
import { config } from './config';

Sentry.init({
  dsn: config.get('sentry.dsn'),
});

export * as Sentry from '@sentry/node';
