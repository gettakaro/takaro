import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player, gameServerId, arguments: args, module: mod } = data;

  const varKey = 'lottery_tickets_bought';

  if (!checkPermission(player, 'LOTTERY_BUY')) {
    throw new TakaroUserError('You do not have permission to buy lottery tickets.');
  }

  const tickets = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        key: [varKey],
        moduleId: [mod.moduleId],
        playerId: [player.playerId],
      },
    })
  ).data.data;

  // Player already has some tickets bought
  if (tickets.length > 0) {
    const ticketBought = tickets[0];

    await takaro.variable.variableControllerUpdate({
      id: ticketBought.id,
      value: ticketBought.value + args.amount,
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
      playerId: player.playerId,
    });
  }

  const ticketPrice = args.amount * mod.userConfig.ticketPrice;
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  await player.pm(`You have successfully bought ${args.amount} tickets for ${ticketPrice} ${currencyName}. Good luck!`);
}

await main();
