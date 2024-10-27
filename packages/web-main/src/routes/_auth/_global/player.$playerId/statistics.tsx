import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/statistics')({
  component: Component,
});

function Component() {
  return <div>Coming soon.</div>;
}
