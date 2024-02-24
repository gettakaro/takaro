import { Card } from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { DateTime } from 'luxon';
import { usePingStat } from 'queries/pog';
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

export const GameServerStats: FC = ({}) => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { playerId } = useParams() as { playerId: string };
  const [timeRange, _] = useState({
    start: DateTime.now().minus({ days: 7 }).toISO()!,
    end: DateTime.now().toISO()!,
  });

  const { data } = usePingStat({
    gameServerId: selectedGameServerId,
    playerId,
    startISO: timeRange.start,
    endISO: timeRange.end,
  });

  console.log(data);
  return (
    <div>
      <Card variant="outline">
        <h2>Ping stats: </h2>
      </Card>
    </div>
  );
};
