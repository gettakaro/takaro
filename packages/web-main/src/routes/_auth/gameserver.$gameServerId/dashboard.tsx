import { HorizontalNav, useTheme } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { Outlet } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_GAMESERVERS'])) {
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
      <HorizontalNav
        variant={'block'}
        links={[
          {
            text: 'Overview',
            to: '/gameserver/$gameServerId/dashboard/overview',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore reusable link
            params: { gameServerId },
          },
          {
            text: 'Console',
            to: '/gameserver/$gameServerId/dashboard/console',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore reusable link
            params: { gameServerId },
          },
          {
            text: 'Statistics',
            to: '/gameserver/$gameServerId/dashboard/statistics',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore reusable link
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
