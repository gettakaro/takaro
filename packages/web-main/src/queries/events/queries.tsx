import { EventOutputArrayDTOAPI, EventSearchInputDTO } from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export const useEvents = (queryParams: EventSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [...eventKeys.list(), { queryParams }],
    queryFn: async () => (await apiClient.event.eventControllerSearch(queryParams)).data,
    keepPreviousData: true,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
  return queryOpts;
};
