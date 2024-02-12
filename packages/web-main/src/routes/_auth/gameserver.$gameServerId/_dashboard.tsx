import { HorizontalNav, useTheme } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/_dashboard')({
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
