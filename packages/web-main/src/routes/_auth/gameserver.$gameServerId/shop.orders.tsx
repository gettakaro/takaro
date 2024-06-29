import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/orders')({
  component: Component,
});

function Component() {
  return <div></div>;
}
