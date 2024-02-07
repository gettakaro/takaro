import { EventOutputArrayDTOAPI, EventSearchInputDTO } from '@takaro/apiclient';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';
import _ from 'lodash';
import { useMemo } from 'react';
import { hasNextPage } from 'queries/util';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
};

export const useEvents = (queryParams: EventSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (await apiClient.event.eventControllerSearch({ ...queryParams, page: pageParam as number })).data,
    initialPageParam: queryParams.page,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};
