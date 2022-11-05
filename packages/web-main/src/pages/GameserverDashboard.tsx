import { styled, Console, Message } from '@takaro/lib-components';
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

  const { data, isLoading, refetch } = useQuery<GameServerOutputDTO>(
    `gameserver/${serverId}`,
    async () => {
      if (!serverId) throw new Error('No server id provided');
      return (await apiClient.gameserver.gameServerControllerGetOne(serverId))
        .data.data;
    }
  );

  function listener(setter: Dispatch<SetStateAction<Message[]>>) {
    console.log('RUNNING LISTENER');
    socket.on('gameEvent', (type, data) => {
      setter((prev: Message[]) => [
        ...prev,
        {
          type: 'info',
          timestamp: data.timestamp,
          data: data.msg,
        },
      ]);
    });
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameserver dashboard</title>
      </Helmet>
      <h1>Dashboard</h1>

      <Console
        listener={listener}
        onExecuteCommand={async () => {
          return {
            type: 'command',
            data: 'response here',
            timestamp: new Date().toISOString(),
          };
        }}
      />
    </Fragment>
  );
};

export default GameServerDashboard;
