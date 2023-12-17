import { FC } from 'react';
import { Loading } from '@takaro/lib-components';
import { usePlayerOnGameServers } from 'queries/players/queries';

interface IPlayerInventoryProps {
  playerId: string;
}

export const PlayerInventoryTable: FC<IPlayerInventoryProps> = ({ playerId }) => {
  const { data, isLoading } = usePlayerOnGameServers({
    filters: {
      playerId: [playerId],
    },
  });

  if (isLoading) return <Loading />;

  if (!data?.data.length) return <p>No inventory data</p>;

  return data?.data.map((player) => {
    return (
      <pre>
        <code>{JSON.stringify(player.inventory, null, 2)}</code>
      </pre>
    );
  });
};
