import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
  EventOutputDTOEventNameEnum as EventName,
} from '@takaro/apiclient';
import { socket } from 'hooks/useSocket';
import { eventsQueryOptions } from 'queries/event';
import { getApiClient } from 'util/getApiClient';
import { FC, useEffect } from 'react';
import { Card, Skeleton } from '@takaro/lib-components';
import { CardBody } from './style';
import { Scrollable } from '../style';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useQuery } from '@tanstack/react-query';

interface ChatMessagesCardProps {
  gameServerId: string;
}

export const ChatMessagesCard: FC<ChatMessagesCardProps> = ({ gameServerId }) => {
  const apiClient = getApiClient();

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
    <Card variant="outline">
      <Card.Title label="Chat messages" />
      <CardBody>
        <Scrollable>{events?.reverse().map((event) => <ChatMessage key={event.id} event={event} />)}</Scrollable>
      </CardBody>
      <ChatInput
        onSubmit={async (msg) => {
          await apiClient.gameserver.gameServerControllerSendMessage(gameServerId, {
            message: msg,
          });
          refetch();
        }}
      />
    </Card>
  );
};
