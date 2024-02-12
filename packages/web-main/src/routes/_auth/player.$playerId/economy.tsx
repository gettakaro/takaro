import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/player/$playerId/economy')({
  component: Component,
});

function Component() {
  return <>Coming soon</>;
}
