import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GameServerSelectView as GameServerSelectQueryView, GameServerSelectQueryViewProps } from '.';
import { useForm, SubmitHandler } from 'react-hook-form';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum } from '@takaro/apiclient';

export default {
  title: 'GameServerSelectQueryField',
  component: GameServerSelectQueryView,
} as Meta<GameServerSelectQueryViewProps>;

interface IFormInputs {
  gameServerId: string;
}

export const Default: StoryFn<GameServerSelectQueryViewProps> = () => {
  const { control, handleSubmit } = useForm<IFormInputs>();

  const gameServers: GameServerOutputDTO[] = [
    {
      name: 'Online Mock Server 1',
      reachable: true,
      type: GameServerOutputDTOTypeEnum.Mock,
      id: '1',
      createdAt: '',
      updatedAt: '',
      enabled: true,
      connectionInfo: {},
    },
    {
      name: 'Offline Rust Server',
      reachable: false,
      type: GameServerOutputDTOTypeEnum.Rust,
      id: '1',
      createdAt: '',
      updatedAt: '',
      enabled: true,
      connectionInfo: {},
    },
  ];

  const onSubmit: SubmitHandler<IFormInputs> = ({ gameServerId }) => {
    console.log(gameServerId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GameServerSelectQueryView
        fetchNextPage={() => {}}
        isFetchingNextPage={false}
        hasNextPage={false}
        isFetching={false}
        control={control}
        setGameServerName={() => {}}
        name="gameServerId"
        gameServers={gameServers}
      />
    </form>
  );
};
