import { Stats, styled, Skeleton, useTheme, HorizontalNav, Avatar, getInitials } from '@takaro/lib-components';
import { Outlet, redirect } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { playerOptions, playerOnGameServersOptions } from 'queries/players/queries';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { createFileRoute } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/player/$playerId')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [player, pogs] = await Promise.all([
      context.queryClient.ensureQueryData(playerOptions(params.playerId)),
      context.queryClient.ensureQueryData(playerOnGameServersOptions({ filters: { playerId: [params.playerId] } })),
    ]);
    return { player, pogs };
  },
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

const Container = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

function Component() {
  const { playerId } = Route.useParams();
  const { player, pogs } = Route.useLoaderData();
  useDocumentTitle(player?.name || 'Player Profile');

  const theme = useTheme();
  // const pog = pogs.data.find((p) => p.playerId === playerId);

  return (
    <Container>
      <Header>
        <Avatar size="large" variant="rounded">
          <Avatar.Image src={player?.steamAvatar} />
          <Avatar.FallBack>{getInitials(player?.name)}</Avatar.FallBack>
        </Avatar>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
          <h1 style={{ lineHeight: 1 }}>{player?.name}</h1>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Stats border={false} direction="horizontal">
              <Stats.Stat
                description="Member since"
                value={DateTime.fromISO(player?.createdAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat
                description="Last seen"
                value={DateTime.fromISO(player?.updatedAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat description="Joined servers" value={`${pogs.data.length ?? 0}`} />
            </Stats>
          </div>
        </div>
      </Header>

      <HorizontalNav
        links={[
          {
            text: 'Global',
            to: '/player/$playerId/global',
            params: { playerId },
          },
          {
            text: 'Events',
            to: '/player/$playerId/events',
            params: { playerId },
          },
          {
            text: 'Inventory',
            to: '/player/$playerId/inventory',
            params: { playerId },
          },
          {
            text: 'Economy',
            to: '/player/$playerId/economy',
            params: { playerId },
          },
        ]}
        variant="underline"
      />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Container>
  );
}
