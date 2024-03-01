import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Currency } from './currency';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';

export const PlayerEconomy: FC = () => {
  const { playerId } = useParams() as { playerId: string };
  const { selectedGameServerId } = useSelectedGameServer();

  return <Currency playerId={playerId} gameServerId={selectedGameServerId} />;
};
