import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
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
  return <Outlet />;
}
