import { Skeleton, useTheme } from '@takaro/lib-components';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { Section } from './-player/style';
import { createFileRoute } from '@tanstack/react-router';
import { playerQueryOptions } from 'queries/player';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { useQueries } from '@tanstack/react-query';
import { PlayerDetails } from './-player/PlayerDetails';

export const Route = createFileRoute('/_auth/_global/player/$playerId/events')({
  loader: async ({ params, context }) => {
    const [player, pogs] = await Promise.all([
      context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({ filters: { playerId: [params.playerId] } })
      ),
    ]);
    return { player, pogs };
  },
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

function Component() {
  const { playerId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const theme = useTheme();

  const [{ data: player }, { data: pogs }] = useQueries({
    queries: [
      { ...playerQueryOptions(playerId), initialData: loaderData.player },
      { ...playersOnGameServersQueryOptions({ filters: { playerId: [playerId] } }), initialData: loaderData.pogs },
    ],
  });

  return (
    <>
      <PlayerDetails player={player} pogs={pogs} />
      <Section style={{ height: '100%', overflowY: 'auto', paddingRight: theme.spacing[2] }}>
        <EventFeedWidget query={{ filters: { playerId: [playerId] } }} />
      </Section>
    </>
  );
}
