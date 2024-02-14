import { EventOutputArrayDTOAPI, EventSearchInputDTO } from '@takaro/apiclient';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import _ from 'lodash';
import { hasNextPage } from 'queries/util';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
};

export const eventsOptions = (queryParams: EventSearchInputDTO) =>
  queryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), { ...queryParams }],
    queryFn: async () => (await getApiClient().event.eventControllerSearch(queryParams)).data,
  });

export const eventsInfiniteQueryOptions = (queryParams: EventSearchInputDTO) =>
  infiniteQueryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), { ...queryParams }].filter(Boolean),
    queryFn: async () => (await getApiClient().event.eventControllerSearch(queryParams)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
