import { Console, Message, styled } from '@takaro/lib-components';
import { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Helmet } from 'react-helmet';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';
import { useGameServer } from 'queries/gameservers';
import { useGameServerOutletContext } from 'frames/GameServerFrame';

const ConsoleContainer = styled.div`
  height: 80vh;
`;

const GameServerDashboard: FC = () => {
  const apiClient = useApiClient();
  const { socket } = useSocket();
  const { gameServerId } = useGameServerOutletContext();
  const { data: gameServer, isLoading } = useGameServer(gameServerId);

  // TODO: handle this
  if (isLoading) {
    return <>'console loading...'</>;
  }

  // TODO: handle this
  if (gameServer === undefined) {
    return <>'could not load data'</>;
  }

  function handleMessageFactory(setter: Dispatch<SetStateAction<Message[]>>) {
    const handler = (handleGameserverId: string, type, data) => {
      if (handleGameserverId !== gameServerId) return;
      setter((prev: Message[]) => [
        ...prev,
        {
          type: 'info',
          timestamp: data.timestamp,
          data: data.msg,
        },
      ]);
    };

    return {
      on: () => {
        socket.on('gameEvent', handler);
      },
      off: () => {
        socket.off('gameEvent', handler);
      },
    };
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameserver dashboard</title>
      </Helmet>
      <ConsoleContainer>
        <Console
          listenerFactory={handleMessageFactory}
          onExecuteCommand={async (command: string) => {
            const result =
              await apiClient.gameserver.gameServerControllerExecuteCommand(
                gameServer.id,
                { command }
              );
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
