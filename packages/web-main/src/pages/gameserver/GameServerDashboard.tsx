import { Console, Message, styled } from '@takaro/lib-components';
import { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Helmet } from 'react-helmet';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';
import { useGameServer } from 'hooks/useGameServer';
import { useParams } from 'react-router-dom';

const ConsoleContainer = styled.div`
  width: 600px;
  height: 80vh;
`;

const GameServerDashboard: FC = () => {
  const apiClient = useApiClient();
  const { socket } = useSocket();
  const { gameServerData } = useGameServer();
  const { serverId } = useParams();

  function handleMessageFactory(setter: Dispatch<SetStateAction<Message[]>>) {
    const handler = (gameserverId: string, type, data) => {
      if (gameserverId !== serverId) return;
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
                gameServerData.id,
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
