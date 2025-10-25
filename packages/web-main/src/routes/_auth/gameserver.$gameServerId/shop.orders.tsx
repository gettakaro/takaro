import { createFileRoute } from '@tanstack/react-router';
import { ShopOrderTableView } from '../../../components/shop/shopOrderTableView';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/orders')({
  component: Component,
})!;

function Component() {
  const { gameServerId } = Route.useParams();
  return <ShopOrderTableView gameServerId={gameServerId} />;
}
