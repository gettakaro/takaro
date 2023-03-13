import {
  register,
  collectDefaultMetrics,
  Counter,
  CounterConfiguration,
} from 'prom-client';
import { logger } from './logger.js';
import { ctx } from './main.js';

const counters = new Map<string, Counter<string>>();

/**
 * Wraps a function and creates a metric that counts how many times it was called
 * @param fn Any callable function
 */
export function addCounter(
  fn: CallableFunction,
  counterConfiguration: CounterConfiguration<string>
) {
  if (!counters.has(counterConfiguration.name)) {
    counters.set(
      counterConfiguration.name,
      new Counter({
        ...counterConfiguration,
        labelNames: ['status', 'domain', 'gameServer', 'user'],
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const counter = counters.get(counterConfiguration.name)!;

  return async (...args: unknown[]) => {
    try {
      const result = await fn(...args);
      counter.inc({
        status: 'success',
        domain: ctx.data.domain,
        gameServer: ctx.data.gameServer,
        user: ctx.data.user,
      });
      return result;
    } catch (error) {
      counter.inc({
        status: 'fail',
        domain: ctx.data.domain,
        gameServer: ctx.data.gameServer,
        user: ctx.data.user,
      });
      throw error;
    }
  };
}

export function enableDefaultNodejsMetrics() {
  const log = logger('metrics');
  try {
    collectDefaultMetrics();
  } catch (error) {
    log.warn('Failed to enable NodeJS metrics', error);
  }
}

export function getMetrics() {
  return register.metrics();
}
