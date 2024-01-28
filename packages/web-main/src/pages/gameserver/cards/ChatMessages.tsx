import {
  EventChatMessage,
  EventOutputDTO,
  EventSearchInputAllowedFiltersEventNameEnum,
  EventSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Avatar, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { useEvents } from 'queries/events';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { Scrollable, Card } from './style';
import { Player } from 'components/Player';
import { DateTime } from 'luxon';
import { useApiClient } from 'hooks/useApiClient';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';

const Message = styled.span`
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: grid;
  grid-template-columns: 36px auto 1fr;
  gap: ${({ theme }) => theme.spacing['0_75']};
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

const ChatMessage: FC<{ chatMessage: EventOutputDTO }> = ({ chatMessage }) => {
  const theme = useTheme();

  const meta = chatMessage.meta as EventChatMessage;
  if (!meta || !('msg' in meta)) return null;

  const friendlyTimeStamp = DateTime.fromISO(chatMessage.createdAt).toLocaleString(DateTime.TIME_24_SIMPLE);
  const player = chatMessage.player;

  if (!chatMessage.playerId) {
    const avatar = (
      <Avatar size="tiny">
        <Avatar.Image src={'/favicon.ico'} alt={'takaro icon'} />
      </Avatar>
    );
    return (
      <Message>
        <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing['0_5'],
            fontWeight: 'bold',
          }}
        >
          {avatar} Server
        </span>
        <span>{meta.msg as string}</span>
      </Message>
    );
  }

  if (!player) return null;

  return (
    <Message>
      <span style={{ color: theme.colors.textAlt }}>{friendlyTimeStamp}</span>
      <span style={{ fontWeight: 'bold' }}>
        <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
      </span>
      <span>{meta.msg as string}</span>
    </Message>
  );
};

export type ChatInputProps = {
  onSubmit: (message: string) => void;
};

export const ChatInput: FC<ChatInputProps> = ({ onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.length > 0) {
        setInput('');
        onSubmit(input);
      }
    }
  };

  return (
    <input
      placeholder="Send a message..."
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
      value={input}
      ref={inputRef}
    />
  );
};

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[1]};
  height: 100%;
`;

export const ChatMessagesCard: FC = () => {
  const apiClient = useApiClient();
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

  const messages = data?.pages?.flatMap((page) => page.data) ?? [];

  return (
    <Card variant={'outline'}>
      <CardBody>
        <Scrollable>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} chatMessage={msg} />
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
    </Card>
  );
};
