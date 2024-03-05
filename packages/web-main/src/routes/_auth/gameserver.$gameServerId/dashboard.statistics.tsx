import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/statistics')({
  component: Component,
});

function Component() {
  return <> No statistics yet </>;
}
