import { Chip } from '@takaro/lib-components';
import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { gameServerQueryOptions } from '../queries/gameserver';

interface GameServerProps {
  gameServerId: string;
  gameServerName?: string;
  isLoading?: boolean;
  hasError?: boolean;
}

type GameServerContainerProps = Pick<GameServerProps, 'gameServerId'>;

export const GameServerContainer: FC<GameServerContainerProps> = ({ gameServerId }) => {
  const { data: gameServer, isLoading, error } = useQuery(gameServerQueryOptions(gameServerId));

  return (
    <GameServer
      gameServerId={gameServerId}
      gameServerName={gameServer?.name}
      isLoading={isLoading}
      hasError={error !== null}
    />
  );
};

export const GameServer: FC<GameServerProps> = ({ gameServerId, gameServerName, isLoading, hasError }) => {
  if (isLoading) {
    return <Chip color="backgroundAccent" isLoading label="" />;
  }

  if (!gameServerName || hasError) {
    return <Chip color="backgroundAccent" label="unknown" />;
  }

  return (
    <Link
      to={'/gameserver/$gameServerId'}
      params={{ gameServerId }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
    >
      <span>{gameServerName}</span>
    </Link>
  );
};
