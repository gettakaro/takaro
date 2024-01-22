import { Client, EventOutputArrayDTOAPI, EventSearchInputDTO } from '@takaro/apiclient';
import { UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
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

const fetchEvents = async (apiClient: Client, queryParams: EventSearchInputDTO): Promise<EventOutputArrayDTOAPI> => {
  const events = await apiClient.event.eventControllerSearch(queryParams);
  return events.data;
};

export const useEvents = (
  queryParams: EventSearchInputDTO = {},
  opts?: UseInfiniteQueryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI, any>>
) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam = queryParams.page }) => {
      const events = await fetchEvents(apiClient, { ...queryParams, page: pageParam });
      return events;
    },
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    ...opts,
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};
