import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  const varKey = 'lottery_tickets_bought';

  if (!checkPermission(pog, 'LOTTERY_VIEW_TICKETS')) {
    throw new TakaroUserError('You do not have permission to view lottery tickets.');
  }

  const tickets = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        key: [varKey],
        moduleId: [mod.id],
        playerId: [pog.playerId],
      },
    })
  ).data.data;

  let ticketsBought = 0;

  if (tickets.length === 1) {
    ticketsBought = parseInt(JSON.parse(tickets[0].value).amount, 10);
  }

  await pog.pm(`You have bought ${ticketsBought} tickets.`);
}

await main();
