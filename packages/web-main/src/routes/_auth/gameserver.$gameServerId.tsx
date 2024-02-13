import { HorizontalNav, useTheme } from '@takaro/lib-components';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const theme = useTheme();
  const { gameServerId } = Route.useParams();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        gap: theme.spacing[2],
      }}
    >
      <HorizontalNav
        variant={'block'}
        links={[
          {
            text: 'Overview',
            to: '/gameserver/$gameServerId/dashboard/overview',
            params: { gameServerId },
          },
          {
            text: 'Console',
            to: '/gameserver/$gameServerId/dashboard/console',
            params: { gameServerId },
          },
          {
            text: 'Statistics',
            to: '/gameserver/$gameServerId/dashboard/statistics',
            params: { gameServerId },
          },
        ]}
      />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
