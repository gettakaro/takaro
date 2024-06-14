import { EventOutputArrayDTOAPI, EventOutputDTO, EventSearchInputDTO } from '@takaro/apiclient';
import {
  InfiniteData,
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import _ from 'lodash';
import { hasNextPage, queryParamsToArray } from './util';
import { useSocket } from 'hooks/useSocket';
import { useEffect } from 'react';
import { ShouldIncludeEvent } from 'components/events/shouldIncludeEvent';
import { DateTime } from 'luxon';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
};

export const eventsQueryOptions = (queryParams: EventSearchInputDTO) =>
  queryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [...eventKeys.list(), queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().event.eventControllerSearch(queryParams)).data,
  });

export const eventsInfiniteQueryOptions = (queryParams: EventSearchInputDTO) =>
  infiniteQueryOptions<EventOutputArrayDTOAPI, AxiosError<EventOutputArrayDTOAPI>>({
    queryKey: [eventKeys.list(), queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().event.eventControllerSearch(queryParams)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });

interface EventSubscriptionOptions extends EventSearchInputDTO {
  enabled?: boolean;
}

export const useEventSubscription = ({ enabled = true, ...queryParams }: EventSubscriptionOptions) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      socket.off('event');
      return;
    }

    socket.on('event', (newEvent: EventOutputDTO) => {
      queryClient.setQueryData<InfiniteData<EventOutputArrayDTOAPI>>(eventKeys.list(), (prev) => {
        // The socket returns all new events, we need to filter it based on the queryParams
        if (
          ShouldIncludeEvent(newEvent, {
            startDate: queryParams.greaterThan.createdAt ? DateTime.fromISO(queryParams.greaterThan.createdAt) : null,
            endDate: queryParams.lessThan.createdAt ? DateTime.fromISO(queryParams.lessThan.createdAt) : null,
            eventTypes: queryParams.search?.eventName ?? [],
            filters: [], // TODO: implement filters
          }) === false
        ) {
          return prev;
        }

        if (!prev) {
          return {
            pages: [
              {
                data: [newEvent],
                meta: {
                  page: 0,
                  total: 1,
                  limit: queryParams.limit,
                  error: { code: '', message: '', details: '' },
                  serverTime: '',
                },
              },
            ],
            pageParams: [0],
          };
        }

        return addEventToData(prev, newEvent);
      });
    });

    return () => {
      socket.off('event');
    };
  }, []);
};

const addEventToData = (prev: InfiniteData<EventOutputArrayDTOAPI>, newEvent: EventOutputDTO) => {
  // Check if the first page exists and is at its limit
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const firstPageIsAtLimit = prev?.pages[0]?.data.length >= prev?.pages[0]?.meta.limit;

  if (firstPageIsAtLimit) {
    // Create a new page with the new event
    const newPage = {
      data: [newEvent],
      meta: {
        limit: prev.pages[0].meta.limit,
        error: prev.pages[0].meta.error,
        page: 0, // New page becomes the first page
        serverTime: prev.pages[0].meta.serverTime,
        total: prev.pages[0].meta.total ? prev.pages[0].meta.total + 1 : 1,
      },
    };

    // Increment page index for all other pages
    const updatedPages = prev.pages.map((page, index) => ({
      ...page,
      meta: {
        ...page.meta,
        page: index + 1, // Increment page index
      },
    }));

    // Return new data structure with the new page and updated pages
    return {
      ...prev,
      pages: [newPage, ...updatedPages],
    };
  } else {
    // If the first page is not at its limit, add the new event to the first page
    return {
      ...prev,
      pages: prev.pages.map((page, index) => {
        if (index === 0) {
          // Only update the first page
          return {
            ...page,
            data: [newEvent, ...page.data],
            meta: {
              ...page.meta,
              total: page.meta.total ? page.meta.total + 1 : 1,
            },
          };
        }
        return page;
      }),
    };
  }
};
