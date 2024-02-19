import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/')({
  beforeLoad: ({ navigate }) => {
    navigate({ to: '/player/$playerId/info' });
  },
});
