import { createFileRoute, redirect } from '@tanstack/react-router';
import { playerQueryOptions } from 'queries/player';

export const Route = createFileRoute('/_auth/_global/player/$playerId/')({
  loader: async ({ params, context }) => {
    const player = await context.queryClient.ensureQueryData(playerQueryOptions(params.playerId));

    if (player === undefined || player.playerOnGameServers === undefined || player.playerOnGameServers.length === 0) {
      redirect({ to: '/player/$playerId/statistics', params: { playerId: params.playerId } });
    }
    redirect({
      to: '/player/$playerId/$gameServerId',
      params: { playerId: params.playerId, gameServerId: player.playerOnGameServers![0].gameServerId },
    });
  },
});
