import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ShopOrderTableView } from './-components/shop/shopOrderTableView';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/orders')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
})!;

function Component() {
  const { gameServerId } = Route.useParams();

  return <ShopOrderTableView gameServerId={gameServerId} />;
}
