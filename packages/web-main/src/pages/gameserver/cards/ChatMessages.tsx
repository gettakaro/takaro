import {
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Loading, styled } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { PATHS } from 'paths';
import { useEvents } from 'queries/events';
import { FC, useEffect } from 'react';

const SteamAvatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
`;

const ChatContainer = styled.div`
  border-radius: 8px;
  max-height: 20vh;
  overflow-y: scroll;
`;

const Message = styled.span`
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: grid;
  grid-template-columns: 1.5fr 2fr 5fr;
`;

const PlayerName = styled.span`
  font-weight: bold;
  margin-right: 10px;
  margin-left: 10px;
`;

const PlayerContainer = styled.span`
  display: grid;
  grid-template-columns: 2rem 1fr;
  align-items: center;
`;

const ChatMessage: FC<{ chatMessage: EventOutputDTO }> = ({ chatMessage }) => {
  if (!chatMessage.meta || !('message' in chatMessage.meta)) return null;
  let avatarUrl = '/favicon.ico';

  if (chatMessage.player?.steamAvatar) avatarUrl = chatMessage.player?.steamAvatar;

  const friendlyTimeStamp = new Date(chatMessage.createdAt).toLocaleTimeString();

  return (
    <Message>
      <span>{friendlyTimeStamp}</span>
      <a href={PATHS.player.profile(chatMessage.player?.id as string)}>
        <PlayerContainer>
          <SteamAvatar src={avatarUrl} />
          <PlayerName>{chatMessage.player?.name}</PlayerName>
        </PlayerContainer>
      </a>
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

  return <ChatContainer>{components}</ChatContainer>;
};
