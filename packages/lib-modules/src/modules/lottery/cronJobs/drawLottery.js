import { getTakaro, getData } from '@takaro/helpers';

function getTotalPrize(playerAmount, ticketPrice, profitMargin) {
  const rawTotal = playerAmount * ticketPrice;
  const profit = rawTotal * profitMargin;
  const totalPrize = rawTotal - profit;

  return totalPrize;
}

async function drawWinner(takaro, tickets) {
  const randomIndex = Math.floor(Math.random() * tickets.length);
  const winnerTicket = tickets[randomIndex];

  const winner = await takaro.player.playerControllerGetOne(winnerTicket.playerId);

  return winner.data.data;
}

async function cleanUp(takaro, tickets) {
  const deleteTasks = tickets.map((ticket) => takaro.variable.variableControllerDelete(ticket.id));
  await Promise.all(deleteTasks);
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { gameServerId, module: mod } = data;

  // check how many players are in the lottery
  const tickets = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
        key: ['lottery_tickets_bought'],
      },
    })
  ).data.data;

  if (tickets.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: 'No one has bought any tickets. The lottery has been cancelled.',
    });
    return;
  }

  const totalPrize = getTotalPrize(tickets.length, mod.userConfig.ticketPrice, mod.userConfig.profitMargin);
  const winner = await drawWinner(takaro, tickets);

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: 'The lottery raffle is about to start!',
  });
  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, { message: 'drumrolls please...' });
  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, { message: 'The winner is...' });
  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `${winner.name}! Congratulations! You have won ${totalPrize} ${currencyName}!`,
  });

  await cleanUp(takaro, tickets);
}

await main();
