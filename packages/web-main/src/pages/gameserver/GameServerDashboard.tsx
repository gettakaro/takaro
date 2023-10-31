import { Console, Message, Skeleton, styled } from '@takaro/lib-components';
import { FC, Fragment, useEffect, useState } from 'react';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';
import { useGameServer } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const ConsoleContainer = styled.div`
  height: 80vh;
`;

const GameServerDashboard: FC = () => {
  useDocumentTitle('Gameserver dashboard');

  const apiClient = useApiClient();
  const { socket } = useSocket();
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServer, isLoading } = useGameServer(selectedGameServerId);

  const [messages, setMessages] = useState<Message[]>([]);

  // TODO: don't clear console on server change, so that you persist the console history for each gameserver
  useEffect(() => {
    setMessages([]);
  }, [selectedGameServerId]);

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

      setMessages((prev: Message[]) => [
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
      <ConsoleContainer>
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
    </Fragment>
  );
};

export default GameServerDashboard;
