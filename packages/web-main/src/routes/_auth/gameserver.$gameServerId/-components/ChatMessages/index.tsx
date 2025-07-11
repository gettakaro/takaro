import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
  EventOutputDTOEventNameEnum as EventName,
} from '@takaro/apiclient';
import { useSocket } from '../../../../../hooks/useSocket';
import { eventsQueryOptions } from '../../../../../queries/event';
import { getApiClient } from '../../../../../util/getApiClient';
import { FC, useEffect, ChangeEvent } from 'react';
import { Card, Skeleton, UnControlledCheckBox } from '@takaro/lib-components';
import { CardBody, FollowContainer, FollowLabel } from './style';
import { Scrollable } from '../style';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatAutoScroll } from './useChatAutoScroll';
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

  const events = data?.data || [];
  const { scrollContainerRef, isFollowEnabled, setIsFollowEnabled, handleScroll } = useChatAutoScroll(events);

  const handleFollowChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsFollowEnabled(e.target.checked);
  };

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;
  return (
    <Card variant="outline">
      <Card.Title label="Chat messages">
        <FollowContainer>
          <UnControlledCheckBox
            id="follow-chat"
            name="follow-chat"
            value={isFollowEnabled}
            onChange={handleFollowChange}
            hasDescription={false}
            hasError={false}
          />
          <FollowLabel htmlFor="follow-chat">Follow</FollowLabel>
        </FollowContainer>
      </Card.Title>
      <CardBody>
        <Scrollable ref={scrollContainerRef} onScroll={handleScroll}>
          {[...events].reverse().map((event) => (
            <ChatMessage key={event.id} event={event} />
          ))}
        </Scrollable>
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
