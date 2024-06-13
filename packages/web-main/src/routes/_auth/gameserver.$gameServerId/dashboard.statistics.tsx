import { LineChart, Card } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlayersOnlineStatsQueryOptions } from 'queries/stats';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/statistics')({
  component: Component,
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(PlayersOnlineStatsQueryOptions());
  },
});

function Component() {
  const { gameServerId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data } = useQuery({ ...PlayersOnlineStatsQueryOptions(gameServerId), initialData: loaderData });

  return (
    <Card>
      <div style={{ height: '500px', width: '500px', position: 'relative' }}>
        <LineChart
          name="Players online"
          data={data.values}
          xAccessor={(d) => new Date(d[0] * 1000)}
          yAccessor={(d) => d[1]}
          curveType="curveBasis"
        />
      </div>
    </Card>
  );
}
