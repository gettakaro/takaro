import { createFileRoute } from '@tanstack/react-router';
import { ShopOrderTableView } from '../../../components/shop/shopOrderTableView';

export const Route = createFileRoute('/_auth/_player/shop/$gameServerId/orders')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  return <ShopOrderTableView gameServerId={gameServerId} />;
}
