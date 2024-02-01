import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { pog, gameServerId, arguments: args, module: mod } = data;

  const varKey = 'lottery_tickets_bought';

  if (!checkPermission(pog, 'LOTTERY_BUY')) {
    throw new TakaroUserError('You do not have permission to buy lottery tickets.');
  }

  if (args.amount < 1) {
    throw new TakaroUserError('You must buy at least 1 ticket.');
  }

  const tickets = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        key: [varKey],
        moduleId: [mod.moduleId],
        playerId: [pog.playerId],
      },
    })
  ).data.data;

  // Player already has some tickets bought
  if (tickets.length > 0) {
    const ticketsBought = tickets[0];

    const ticketsBoughtAmount = parseInt(JSON.parse(ticketsBought.value).amount, 10);

    await takaro.variable.variableControllerUpdate(ticketsBought.id, {
      key: varKey,
      playerId: pog.playerId,
      moduleId: mod.moduleId,
      gameServerId,
      value: JSON.stringify({ amount: ticketsBoughtAmount + args.amount }),
    });
  }
  // Player has no tickets bought
  else {
    await takaro.variable.variableControllerCreate({
      key: varKey,
      value: JSON.stringify({
        amount: args.amount,
      }),
      gameServerId,
      moduleId: mod.moduleId,
      playerId: pog.playerId,
    });
  }

  const ticketPrice = args.amount * mod.systemConfig.commands.buyTicket.cost;
  await takaro.playerOnGameserver.playerOnGameServerControllerDeductCurrency(gameServerId, pog.playerId, {
    currency: ticketPrice,
  });

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data.value;

  await pog.pm(`You have successfully bought ${args.amount} tickets for ${ticketPrice} ${currencyName}. Good luck!`);
}

await main();
