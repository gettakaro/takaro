import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
  EventOutputDTOEventNameEnum as EventName,
} from '@takaro/apiclient';
import { useSocket } from 'hooks/useSocket';
import { eventsQueryOptions } from 'queries/event';
import { getApiClient } from 'util/getApiClient';
import { FC, useEffect } from 'react';
import { Skeleton } from '@takaro/lib-components';
import { CardBody } from './style';
import { StyledCard, Scrollable } from '../style';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

export const ChatMessagesCard: FC = () => {
  const apiClient = getApiClient();
  const { gameServerId } = getRouteApi('/_auth/gameserver/$gameServerId/dashboard/overview').useParams();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = useQuery(
    eventsQueryOptions({
      filters: {
        gameserverId: [gameServerId],
        eventName: [
          EventSearchInputAllowedFiltersEventNameEnum.ChatMessage,
          EventName.PlayerConnected,
          EventName.PlayerDisconnected,
        ],
      },
      sortBy: 'createdAt',
      sortDirection: EventSearchInputDTOSortDirectionEnum.Desc,
      extend: ['player'],
    }),
  );

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (
        event.eventName === EventName.ChatMessage ||
        event.eventName === EventName.PlayerConnected ||
        event.eventName === EventName.PlayerDisconnected
      )
        refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;
  const events = data?.data;

  return (
    <StyledCard variant={'outline'}>
      <CardBody>
        <Scrollable>{events?.reverse().map((event) => <ChatMessage key={event.id} event={event} />)}</Scrollable>
        <ChatInput
          onSubmit={async (msg) => {
            await apiClient.gameserver.gameServerControllerSendMessage(gameServerId, {
              message: msg,
            });
            refetch();
          }}
        />
      </CardBody>
    </StyledCard>
  );
};
