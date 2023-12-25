import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player, gameServerId, module: mod } = data;

  const varKey = 'lottery_tickets_bought';

  if (!checkPermission(player, 'LOTTERY_VIEW_TICKETS')) {
    throw new TakaroUserError('You do not have permission to view lottery tickets.');
  }

  const vars = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId,
        key: varKey,
        moduleId: mod.id,
        playerId: player.id,
      },
    })
  ).data.data;

  let ticketsBought = 0;

  if (vars.length > 0) {
    ticketsBought = parseInt(JSON.parse(vars[0].value).amount, 10);
  }

  await player.pm(`You have bought ${ticketsBought} tickets.`);
}

await main();
