import { Console, Message, Skeleton, styled, useLocalStorage } from '@takaro/lib-components';
import { FC, Fragment, useEffect } from 'react';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';
import { useGameServer } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServerDocumentTitle } from 'hooks/useDocumentTitle';
import { ChatMessagesCard } from './cards/ChatMessages';
import { OnlinePlayersCard } from './cards/OnlinePlayers';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 200px 1fr;
  gap: 1rem;
  height: 85vh;
`;

const DashboardCard = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 1rem;
  border-radius: 1rem;
`;

const ConsoleContainer = styled.div`
  height: 100%;
`;

const EventsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const OnlinePlayerContainer = styled(DashboardCard)``;

const ChatContainer = styled(DashboardCard)``;

const GameServerDashboard: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  useGameServerDocumentTitle('dashboard');
  const apiClient = useApiClient();
  const { socket } = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const { data: gameServer, isLoading } = useGameServer(selectedGameServerId);
  const LOCAL_STORAGE_KEY = `console-${selectedGameServerId}`;

  const {
    storedValue: messages,
    setValue: setMessages,
    error: localStorageError,
  } = useLocalStorage<Message[]>(LOCAL_STORAGE_KEY, []);

  if (localStorageError) {
    enqueueSnackbar('Exceeded local storage quota, clearing console', { type: 'error' });
    setMessages([]);
  }

  useEffect(() => {
    const fiveDaysAgo = DateTime.now().minus({ days: 5 });

    const filteredMessages = messages.filter((message) => {
      const messageTimestamp = DateTime.fromISO(message.timestamp);
      return messageTimestamp > fiveDaysAgo;
    });

    // Update the messages if there are any old ones
    if (filteredMessages.length !== messages.length) {
      setMessages(filteredMessages);
    }
  }, []); // Empty dependency array to run only on mount

  if (isLoading) {
    return (
      <>
        <Skeleton variant="rectangular" width="100%" height="30px" />
        <br />
        <Skeleton variant="rectangular" width="100%" height="80vh" />
      </>
    );
  }

  // TODO: handle this
  if (gameServer === undefined) {
    return <>could not load data</>;
  }

  function handleMessageFactory() {
    // TODO: use typings from backend
    const eventHandler = (
      handleGameserverId: string,
      type: 'player-disconnected' | 'player-connected' | 'chat-message' | 'log-line' | 'discord-message',
      data: Record<string, unknown>
    ) => {
      if (handleGameserverId !== selectedGameServerId) return;

      let msg = data?.msg as string;

      const player = data?.player as Record<string, string> | undefined;

      if (player !== undefined) {
        if (type === 'player-connected') {
          msg = `${player?.name}: connected`;
        }

        if (type === 'player-disconnected') {
          msg = `${player?.name}: disconnected`;
        }

        if (type === 'chat-message') {
          msg = `${player?.name}: ${data?.msg}`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'info',
          timestamp: data?.timestamp as string,
          data: msg,
        },
      ]);
    };

    return {
      on: () => {
        socket.on('gameEvent', eventHandler);
      },
      off: () => {
        socket.off('gameEvent', eventHandler);
      },
    };
  }

  return (
    <Fragment>
      <GridContainer>
        <OnlinePlayerContainer>
          <OnlinePlayersCard />
        </OnlinePlayerContainer>
        <ChatContainer>
          <ChatMessagesCard />
        </ChatContainer>
        <ConsoleContainer>
          Messages are stored for 5 days
          <Console
            messages={messages}
            setMessages={setMessages}
            listenerFactory={handleMessageFactory}
            onExecuteCommand={async (command: string) => {
              const result = await apiClient.gameserver.gameServerControllerExecuteCommand(gameServer.id, { command });
              return {
                type: 'command',
                data: command,
                result: result.data.data.rawResult,
                timestamp: new Date().toISOString(),
              };
            }}
          />
        </ConsoleContainer>
        <EventsContainer>
          <EventFeedWidget query={{ filters: { gameserverId: [gameServer.id] } }} />
        </EventsContainer>
      </GridContainer>
    </Fragment>
  );
};

export default GameServerDashboard;
