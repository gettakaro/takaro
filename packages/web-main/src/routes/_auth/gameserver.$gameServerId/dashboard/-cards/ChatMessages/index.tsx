import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { eventsOptions } from 'queries/events';
import { getApiClient } from 'util/getApiClient';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { FC, useEffect } from 'react';
import { Skeleton } from '@takaro/lib-components';
import { CardBody } from './style';
import { StyledCard, Scrollable } from '../style';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useQuery } from '@tanstack/react-query';

export const ChatMessagesCard: FC = () => {
  const apiClient = getApiClient();
  const { selectedGameServerId } = useSelectedGameServer();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = useQuery(
    eventsOptions({
      filters: {
        gameserverId: [selectedGameServerId],
        eventName: [
          EventSearchInputAllowedFiltersEventNameEnum.ChatMessage,
          EventName.PlayerConnected,
          EventName.PlayerDisconnected,
        ],
      },
      sortBy: 'createdAt',
      sortDirection: EventSearchInputDTOSortDirectionEnum.Desc,
      extend: ['player'],
    })
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
        <Scrollable>
          {events?.map((event) => (
            <ChatMessage key={event.id} event={event} />
          ))}
        </Scrollable>
        <ChatInput
          onSubmit={async (msg) => {
            await apiClient.gameserver.gameServerControllerSendMessage(selectedGameServerId, {
              message: msg,
            });
            refetch();
          }}
        />
      </CardBody>
    </StyledCard>
  );
};
