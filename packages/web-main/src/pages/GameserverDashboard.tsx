import { Console, Loading, Message } from '@takaro/lib-components';
import { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useSocket } from 'hooks/useSocket';

const GameServerDashboard: FC = () => {
  const { serverId } = useParams();
  const apiClient = useApiClient();
  const { socket } = useSocket();

  const { data, isLoading } = useQuery<GameServerOutputDTO>(
    `gameserver/${serverId}`,
    async () => {
      if (!serverId) throw new Error('No server id provided');
      return (await apiClient.gameserver.gameServerControllerGetOne(serverId))
        .data.data;
    }
  );

  function handleMessageFactory(setter: Dispatch<SetStateAction<Message[]>>) {
    const handler = (type, data) => {
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

  if (isLoading) return <Loading />;

  return (
    <Fragment>
      <Helmet>
        <title>Gameserver dashboard</title>
      </Helmet>
      <h1>Dashboard - {data?.name}</h1>

      <Console
        listenerFactory={handleMessageFactory}
        onExecuteCommand={async (command: string) => {
          if (!serverId) throw new Error('No server id provided');
          const result =
            await apiClient.gameserver.gameServerControllerExecuteCommand(
              serverId,
              { command }
            );

          return {
            type: 'command',
            data: result.data.data.rawResult,
            timestamp: new Date().toISOString(),
          };
        }}
      />
    </Fragment>
  );
};

export default GameServerDashboard;
