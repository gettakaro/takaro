import { EventOutputArrayDTOAPI, EventSearchInputDTO } from '@takaro/apiclient';
import { queryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import _ from 'lodash';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
};

export const eventsOptions = (queryParams: EventSearchInputDTO) =>
  queryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), { ...queryParams }],
    queryFn: async () => (await getApiClient().event.eventControllerSearch(queryParams)).data,
  });
