import { queryClient } from './queryClient';
import { routeTree } from './routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { ErrorFallback } from '@takaro/lib-components';

export interface RouterContext {
  queryClient: QueryClient;
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient: queryClient,
  },

  defaultErrorComponent: ErrorFallback,
  // When a link is hovered, it will start preloading the data for the route.
  defaultPreload: false,
  // Atleast hover for 500ms before preloading the route.
  defaultPreloadDelay: 500,

  // Since we're using React Query, we don't want loader calls to ever be stale.
  // This will ensure that the loader is always called when the route is preloaded or visisted.
  defaultPreloadStaleTime: 0,
});
