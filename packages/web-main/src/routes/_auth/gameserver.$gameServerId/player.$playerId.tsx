import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/player/$playerId')({
  component: () => <div>Hello /_auth/gameserver/$gameServerId/player/$playerId!</div>,
});
