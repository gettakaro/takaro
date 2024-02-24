import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputArrayDTOAPI, PlayerOutputWithRolesDTO, PlayerSearchInputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

export const useInfinitePlayers = ({ page, ...queryParams }: PlayerSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.player.playerControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: page,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const usePlayers = (queryParams: PlayerSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), { queryParams }],
    queryFn: async () => (await apiClient.player.playerControllerSearch(queryParams)).data,
    placeholderData: keepPreviousData,
  });
  return queryOpts;
};

export const usePlayer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputWithRolesDTO, AxiosError<PlayerOutputWithRolesDTO>>({
    queryKey: playerKeys.detail(id),
    queryFn: async () => (await apiClient.player.playerControllerGetOne(id)).data.data,
  });
};
