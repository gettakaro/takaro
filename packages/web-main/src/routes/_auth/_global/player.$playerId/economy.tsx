import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/economy')({
  component: Component,
});

function Component() {
  return <>Coming soon</>;
}
