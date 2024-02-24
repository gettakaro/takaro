import { usePingStat } from 'queries/pog';
import { FC } from 'react';
import { DateTime } from 'luxon';
import { Card } from '@takaro/lib-components';

interface PlayerPingProps {
  gameserverId: string;
  playerId: string;
}

export const PlayerPing: FC<PlayerPingProps> = ({ playerId, gameserverId }) => {
  const { isLoading, error } = usePingStat({
    playerId: playerId,
    gameServerId: gameserverId,
    startISO: DateTime.now().set({ second: 0, millisecond: 0 }).minus({ days: 1 }).toISO() as string,
    endISO: DateTime.now().set({ second: 0, millisecond: 0 }).toISO() as string,
  });

  if (isLoading) return <>Loading...</>;

  if (error) {
    console.log('error', error);
  }

  return (
    <Card>
      <h3>Player Ping</h3>
    </Card>
  );
};
