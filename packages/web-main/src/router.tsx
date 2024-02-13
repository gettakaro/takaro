import { queryClient } from './queryClient';
import { routeTree } from './routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { IAuthContext } from 'hooks/useAuth';

export interface RouterContext {
  gameserverId: string;
  setGameserverId: (id: string) => void;
  queryClient: QueryClient;
  auth: IAuthContext;
}

export const router = createRouter({
  routeTree,
  context: {
    gameserverId: undefined!,
    setGameserverId: undefined!,
    auth: undefined!,
    queryClient: queryClient,
  },

  // When a link is hovered, it will start preloading the data for the route.
  defaultPreload: 'intent',
  // Atleast hover for 100ms before preloading the route.
  defaultPreloadDelay: 100,

  // Since we're using React Query, we don't want loader calls to ever be stale.
  // This will ensure that the loader is always called when the route is preloaded or visisted.
  defaultPreloadStaleTime: 0,
});
