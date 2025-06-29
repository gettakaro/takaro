import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const options = {
  staleTime: 15_000, // This means every query will be considered fresh for 15 seconds. When the same query is made within 15 seconds, the cached data will be returned.
  refetchOnWindowFocus: true,
  throwOnError: (error) => {
    if (isAxiosError(error)) {
      if (error.response && error.response.status >= 500) {
        return true;
      }
      return false;
    }
    return true;
  },
  retry: (failureCount, error) => {
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
