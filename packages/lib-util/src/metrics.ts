import {
  register,
  collectDefaultMetrics,
  Counter,
  CounterConfiguration,
} from 'prom-client';
import { logger } from './logger.js';

const log = logger('metrics');

/**
 * Wraps a function and creates a metric that counts how many times it was called
 * @param fn Any callable function
 */
export function addCounter(
  fn: CallableFunction,
  counterConfiguration: CounterConfiguration<string>
) {
  const counter = new Counter({
    ...counterConfiguration,
    labelNames: ['status'],
  });

  return async (...args: unknown[]) => {
    try {
      const result = await fn(...args);
      counter.inc({ status: 'success' });
      return result;
    } catch (error) {
      counter.inc({ status: 'fail' });
      throw error;
    }
  };
}

export function enableDefaultNodejsMetrics() {
  try {
    collectDefaultMetrics();
  } catch (error) {
    log.warn('Failed to enable NodeJS metrics', error);
  }
}

export function getMetrics() {
  return register.metrics();
}
