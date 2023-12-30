import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player, gameServerId, module: mod } = data;

  const varKey = 'lottery_tickets_bought';

  if (!checkPermission(player, 'LOTTERY_VIEW_TICKETS')) {
    throw new TakaroUserError('You do not have permission to view lottery tickets.');
  }

  const tickets = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId,
        key: varKey,
        moduleId: mod.id,
        playerId: player.playerId,
      },
    })
  ).data.data;

  let ticketsBought = 0;

  if (tickets.length === 1) {
    ticketsBought = parseInt(JSON.parse(tickets[0].value).amount, 10);
  }

  await player.pm(`You have bought ${ticketsBought} tickets.`);
}

await main();
