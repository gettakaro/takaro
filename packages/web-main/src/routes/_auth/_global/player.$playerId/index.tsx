import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/')({
  beforeLoad: ({ navigate, params }) => {
    navigate({ to: '/player/$playerId/info', params: { playerId: params.playerId } });
  },
});
