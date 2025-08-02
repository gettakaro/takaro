import axios, { AxiosError, CreateAxiosDefaults } from 'axios';

interface ILog {
  error: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
}

interface ITakaroAxiosOptions {
  logger?: ILog;
}

export class CleanAxiosError extends AxiosError {
  constructor(axiosError: AxiosError) {
    super(axiosError.message, axiosError.code, axiosError.config, axiosError.request, axiosError.response);

    if (axiosError.response) {
      const { status, statusText } = axiosError.response;
      this.message = `Request failed with status ${status} ${statusText}`;
    } else if (axiosError.request) {
      this.message = 'No response received';
    } else {
      this.message = axiosError.message;
    }

    // Strip down the error to a more manageable size when printing it
    // By default Axios throws a HUGE error
    this.toJSON = () => ({
      message: this.message,
      name: this.name,
      method: axiosError.config?.method,
      url: axiosError.config?.url,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      requestTraceId: axiosError.response?.headers['x-trace-id'],
    });
  }
}

/**
 * Creates an opinionated axios instance with defaults
 * @param opts CreateAxiosDefaults - Configuration for the axios instance
 * @param options ITakaroAxiosOptions - Additional options for logging
 */
export function createAxios(opts: CreateAxiosDefaults, options: ITakaroAxiosOptions = {}) {
  const axiosInstance = axios.create(opts);

  // Always add the clean error interceptor
  axiosInstance.interceptors.response.use(
    function (response) {
      return response;
    },
    (error: AxiosError) => {
      return Promise.reject(new CleanAxiosError(error));
    },
  );

  // Add detailed logging if a logger is provided
  if (options.logger) {
    const logger = options.logger;

    axiosInstance.interceptors.request.use((request) => {
      logger.info(`➡️ ${request.method?.toUpperCase()} ${request.url}`, {
        method: request.method,
        url: request.url,
        requestTraceId: request.headers['x-trace-id'],
      });
      return request;
    });

    axiosInstance.interceptors.response.use(
      (response) => {
        logger.info(
          `⬅️ ${response.request.method?.toUpperCase()} ${response.request.path} ${response.status} ${
            response.statusText
          }`,
          {
            status: response.status,
            method: response.request.method,
            url: response.request.url,
            requestTraceId: response.headers['x-trace-id'],
          },
        );

        return response;
      },
      (error: CleanAxiosError) => {
        logger.error('☠️ Request errored', error.toJSON());
        return Promise.reject(error);
      },
    );
  }

  return axiosInstance;
}
