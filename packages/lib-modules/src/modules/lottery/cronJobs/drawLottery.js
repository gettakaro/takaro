import { getTakaro, getData } from '@takaro/helpers';

function getTotalPrize(tickets, ticketPrice, profitMargin) {
  const amount = tickets.reduce((acc, ticket) => {
    const ticketAmount = parseInt(JSON.parse(ticket.value).amount, 10);

    return acc + ticketAmount;
  }, 0);

  const rawTotal = amount * ticketPrice;
  const profit = rawTotal * profitMargin;
  const totalPrize = rawTotal - profit;

  return totalPrize;
}

async function drawWinner(takaro, gameServerId, tickets) {
  const randomIndex = Math.floor(Math.random() * tickets.length);
  const winnerTicket = tickets[randomIndex];

  debugger;
  const winner = (await takaro.player.playerControllerGetOne(winnerTicket.playerId)).data.data;
  const winnerPog = (
    await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        playerId: [winner.id],
      },
    })
  ).data.data[0];

  return {
    name: winner.name,
    pogId: winnerPog.id,
  };
}

async function refundPlayer(takaro, gameServerId, playerId, amount, currencyName) {
  const pog = (
    await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        playerId: [playerId],
      },
    })
  ).data.data[0];

  await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(pog.id, {
    currency: amount,
  });

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You have been refunded ${amount} ${currencyName} because the lottery has been cancelled.`,
    opts: {
      recipient: {
        gameId: pog.gameId,
      },
    },
  });
}

async function cleanUp(takaro, tickets) {
  const deleteTasks = tickets.map((ticket) => takaro.variable.variableControllerDelete(ticket.id));
  await Promise.all(deleteTasks);
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { gameServerId, module: mod } = data;

  let tickets = [];

  try {
    const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;
    const ticketCost = mod.systemConfig.commands.buyTicket.cost;

    tickets = (
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
    if (tickets.length === 1) {
      await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
        message: 'Only one person has bought a ticket. The lottery has been cancelled.',
      });

      const amount = parseInt(JSON.parse(tickets[0].value).amount, 10) * ticketCost;

      await refundPlayer(takaro, gameServerId, tickets[0].playerId, amount, currencyName);

      return;
    }

    const totalPrize = getTotalPrize(tickets, ticketCost, mod.userConfig.profitMargin);
    const { name: winnerName, pogId: winnerPogId } = await drawWinner(takaro, gameServerId, tickets);

    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: 'The lottery raffle is about to start!',
    });
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, { message: 'drumrolls please...' });
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, { message: 'The winner is...' });

    await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(winnerPogId, {
      currency: totalPrize,
    });

    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `${winnerName}! Congratulations! You have won ${totalPrize} ${currencyName}!`,
    });
  } finally {
    await cleanUp(takaro, tickets);
  }
}

await main();
