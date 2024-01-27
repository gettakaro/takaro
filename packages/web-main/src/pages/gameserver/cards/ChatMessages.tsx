import {
  EventChatMessage,
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Skeleton, styled, useTheme } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { useEvents } from 'queries/events';
import { FC, useEffect } from 'react';
import { Scrollable, Card } from './style';
import { Player } from 'components/Player';

const Message = styled.span`
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: grid;
  grid-template-columns: 55px auto 1fr;
  gap: ${({ theme }) => theme.spacing['0_75']};
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

const ChatMessage: FC<{ chatMessage: EventOutputDTO }> = ({ chatMessage }) => {
  const meta = chatMessage.meta as EventChatMessage;
  if (!meta || !('msg' in meta)) return null;

  const friendlyTimeStamp = new Date(chatMessage.createdAt).toLocaleTimeString();

  const theme = useTheme();

  const player = chatMessage.player;

  if (!player) {
    return <>Unknown Player</>;
  }

  return (
    <Message>
      <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
      <div style={{ fontWeight: 'bold' }}>
        <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
      </div>
      <span>{meta.msg as string}</span>
    </Message>
  );
};

export const ChatMessagesCard: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = useEvents({
    filters: {
      gameserverId: [selectedGameServerId],
      eventName: [EventSearchInputAllowedFiltersEventNameEnum.ChatMessage],
    },
    sortBy: 'createdAt',
    sortDirection: EventSearchInputDTOSortDirectionEnum.Desc,
    extend: ['player'],
  });

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'chat-message') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  const components = data?.pages[0].data?.map((event) => <ChatMessage key={event.id} chatMessage={event} />);

  return (
    <Card variant={'outline'}>
      <Scrollable>{components}</Scrollable>
    </Card>
  );
};
