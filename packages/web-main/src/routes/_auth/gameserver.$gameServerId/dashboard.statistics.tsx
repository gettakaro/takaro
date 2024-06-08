import { LineChart, Card } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { usePlayersOnlineStats } from 'queries/stats';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/statistics')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const { data } = usePlayersOnlineStats(gameServerId);

  return (
    <Card>
      <div style={{ height: '500px', width: '500px' }}>
        <LineChart
          name="Players online"
          data={data?.values || []}
          xAccessor={(d) => new Date(d[0] * 1000)}
          yAccessor={(d) => d[1]}
          curveType="curveBasis"
        />
      </div>
    </Card>
  );
}
