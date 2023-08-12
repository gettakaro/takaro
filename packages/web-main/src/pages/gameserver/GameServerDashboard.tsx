import { Console, Message, Skeleton, styled } from '@takaro/lib-components';
import { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';
import { useGameServer } from 'queries/gameservers';
import { useGameServerOutletContext } from 'frames/GameServerFrame';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const ConsoleContainer = styled.div`
  height: 80vh;
`;

const GameServerDashboard: FC = () => {
  useDocumentTitle('Gameserver dashboard');
  const apiClient = useApiClient();
  const { socket } = useSocket();
  const { gameServerId } = useGameServerOutletContext();
  const { data: gameServer, isLoading } = useGameServer(gameServerId);

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

  function handleMessageFactory(setter: Dispatch<SetStateAction<Message[]>>) {
    // TODO: use typings from backend
    const eventHandler = (
      handleGameserverId: string,
      type: 'player-disconnected' | 'player-connected' | 'chat-message' | 'log-line' | 'discord-message',
      data: Record<string, unknown>
    ) => {
      if (handleGameserverId !== gameServerId) return;

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

      setter((prev: Message[]) => [
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
