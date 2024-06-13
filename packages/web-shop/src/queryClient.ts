import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as Sentry from '@sentry/react';

const options = {
  staleTime: 15_000, // This means every query will be considered fresh for 15 seconds. When the same query is made within 15 seconds, the cached data will be returned.
  refetchOnWindowFocus: true,
  throwOnError: (error) => {
    if (isAxiosError(error)) {
      if (error.response && error.response.status >= 500) {
        if (error.response && error.response.headers) {
          const traceId = error.response.headers['x-trace-id'];
          if (traceId) {
            Sentry.setTag('traceId', traceId);
          }
        }

        Sentry.captureException(error);
        return true;
      }
      return false;
    }
    Sentry.captureException(error);
    return true;
  },
  retry: (failureCount, error) => {
    // third try, capture the error
    if (failureCount === 3) {
      Sentry.captureException(error);
    }

    // SPECIAL CASE: if there is no `status`, this is `network error` meaning axios could not connect to the server at all
    if (isAxiosError(error) && error.status === undefined) {
      return false;
    }

    if (isAxiosError(error) && error.status && error.status >= 500 && failureCount <= 2) {
      return true;
    }
    return false;
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: options,
    mutations: options,
  },
});
