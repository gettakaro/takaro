import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/')({
<<<<<<< HEAD
  beforeLoad: ({ navigate }) => {
    navigate({ to: '/player/$playerId/info' });
=======
  beforeLoad: ({ navigate, params }) => {
    navigate({ to: '/player/$playerId/info', params: { playerId: params.playerId } });
>>>>>>> origin/main
  },
});
