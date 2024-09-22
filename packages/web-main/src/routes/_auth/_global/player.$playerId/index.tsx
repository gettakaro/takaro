import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/')({
  beforeLoad: ({ params }) => {
    redirect({ to: '/player/$playerId/info', params: { playerId: params.playerId } });
  },
});
