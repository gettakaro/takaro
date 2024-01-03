import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Loading, styled, useTheme } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { useEvents } from 'queries/events';
import { FC, useEffect } from 'react';
import { Scrollable, Card } from './style';
import { Player } from 'components/Player';

const Message = styled.span`
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: grid;
  grid-template-columns: auto 200px 1fr;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

const ChatMessage: FC<{ chatMessage: EventOutputDTO }> = ({ chatMessage }) => {
  if (!chatMessage.meta || !('message' in chatMessage.meta)) return null;

  const friendlyTimeStamp = new Date(chatMessage.createdAt).toLocaleTimeString();

  const theme = useTheme();

  const player = chatMessage.player;

  if (!player) {
    return <>Unknown Player</>;
  }

  return (
    <Message>
      <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
      <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
      <span>{chatMessage.meta.message as string}</span>
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

  if (isLoading) return <Loading />;

  const components = data?.pages[0].data?.map((event) => <ChatMessage key={event.id} chatMessage={event} />);

  return (
    <Card variant={'outline'}>
      <Scrollable>{components}</Scrollable>
    </Card>
  );
};
