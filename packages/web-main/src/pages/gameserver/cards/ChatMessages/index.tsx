import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { useEvents } from 'queries/events';
import { useApiClient } from 'hooks/useApiClient';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { FC, useEffect } from 'react';
import { Skeleton } from '@takaro/lib-components';
import { CardBody } from './style';
import { StyledCard, Scrollable } from '../style';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatMessagesCard: FC = () => {
  const apiClient = useApiClient();
  const { selectedGameServerId } = useSelectedGameServer();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = useEvents({
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
  });

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

  const events = data?.pages?.flatMap((page) => page.data) ?? [];

  return (
    <StyledCard variant={'outline'}>
      <CardBody>
        <Scrollable>
          {events.map((event) => (
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
