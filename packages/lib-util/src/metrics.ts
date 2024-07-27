import { register, Counter, CounterConfiguration } from 'prom-client';
import { ctx } from './main.js';
import { Axios, InternalAxiosRequestConfig, isAxiosError } from 'axios';

const counters = new Map<string, Counter<string>>();

/**
 * Wraps a function and creates a metric that counts how many times it was called
 * @param fn Any callable function
 */
export function addCounter(fn: CallableFunction, counterConfiguration: CounterConfiguration<string>) {
  if (!counters.has(counterConfiguration.name)) {
    counters.set(
      counterConfiguration.name,
      new Counter({
        ...counterConfiguration,
        labelNames: ['status', 'domain', 'gameServer', 'user'],
      }),
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

function sanitizeUrl(cfg?: InternalAxiosRequestConfig) {
  let url;

  if (cfg?.url?.startsWith('http')) {
    url = cfg.url;
  } else {
    url = `${cfg?.baseURL}${cfg?.url}`;
  }

  if (!url) return url;

  let urlObj;

  try {
    urlObj = new URL(url);
  } catch (error) {
    return undefined;
  }

  // Remove any query params
  urlObj.search = '';

  // Replace any UUIDs with a placeholder
  const uuidRegex = /[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/gi;
  urlObj.pathname = urlObj.pathname.replace(uuidRegex, ':id');

  return urlObj.pathname;
}

/**
 * Add Prometheus counter to Axios instance tracking the number of requests and success/fail responses
 * @param axiosInstance Axios instance to add the counter to
 * @param counterConfiguration
 */
export function addCounterToAxios(axiosInstance: Axios, counterConfiguration: CounterConfiguration<string>) {
  axiosInstance.interceptors.response.use(
    (config) => {
      if (!counters.has(counterConfiguration.name)) {
        counters.set(
          counterConfiguration.name,
          new Counter({
            ...counterConfiguration,
            labelNames: ['status', 'domain', 'gameServer', 'method', 'url', 'statusCode'],
          }),
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const counter = counters.get(counterConfiguration.name)!;

      counter.inc({
        status: 'success',
        domain: ctx.data.domain,
        gameServer: ctx.data.gameServer,
        method: config.config.method?.toUpperCase(),
        url: sanitizeUrl(config.config),
        statusCode: config.status,
      });

      return config;
    },
    (error) => {
      if (!counters.has(counterConfiguration.name)) {
        counters.set(
          counterConfiguration.name,
          new Counter({
            ...counterConfiguration,
            labelNames: ['status', 'domain', 'gameServer', 'method', 'url', 'statusCode'],
          }),
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const counter = counters.get(counterConfiguration.name)!;

      if (isAxiosError(error)) {
        counter.inc({
          status: 'fail',
          domain: ctx.data.domain,
          gameServer: ctx.data.gameServer,
          method: error.config?.method?.toUpperCase(),
          url: sanitizeUrl(error.config),
          statusCode: error.response?.status,
        });
      } else {
        counter.inc({
          status: 'fail',
          domain: ctx.data.domain,
          gameServer: ctx.data.gameServer,
          method: 'UNKNOWN',
          url: 'UNKNOWN',
          statusCode: error.code,
        });
      }

      return Promise.reject(error);
    },
  );
}

export function getMetrics() {
  return register.metrics();
}
