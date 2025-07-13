import { HorizontalNav, useTheme } from '@takaro/lib-components';
import { Link, createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ManageGameservers])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const theme = useTheme();

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
      <HorizontalNav variant={'block'}>
        <Link to="/gameserver/$gameServerId/dashboard/overview" params={{ gameServerId }}>
          Overview
        </Link>
        <Link to="/gameserver/$gameServerId/dashboard/console" params={{ gameServerId }}>
          Console
        </Link>
        <Link to="/gameserver/$gameServerId/dashboard/statistics" params={{ gameServerId }}>
          Statistics
        </Link>
        <Link to="/gameserver/$gameServerId/dashboard/players" params={{ gameServerId }}>
          Players
        </Link>
      </HorizontalNav>

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}
