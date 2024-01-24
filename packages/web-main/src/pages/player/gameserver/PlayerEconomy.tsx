import { FC } from 'react';
import { usePingStat } from 'queries/pog';
import { DateTime } from 'luxon';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useParams } from 'react-router-dom';

export const PlayerEconomy: FC = () => {
  const { playerId } = useParams() as { playerId: string };

  const { selectedGameServerId } = useSelectedGameServer();
  const { data, isLoading, error } = usePingStat({
    playerId: playerId,
    gameServerId: selectedGameServerId,
    startISO: DateTime.now().set({ second: 0, millisecond: 0 }).minus({ days: 1 }).toISO() as string,
    endISO: DateTime.now().set({ second: 0, millisecond: 0 }).toISO() as string,
  });

  if (isLoading) return <>Loading...</>;

  if (error) {
    console.log('error', error);
  }

  console.log(data);

  return <>coming soon</>;
};
