import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { gameServerId, player: sender, module: mod } = data;

  // try to find a variable with key "confirmTransfer"
  const variables = (
    await takaro.variable.variableControllerSearch({
      filters: {
        key: 'confirmTransfer',
        gameServerId,
        moduleId: mod.moduleId,
        playerId: sender.playerId,
      },
    })
  ).data.data;

  if (variables.length === 0) {
    await data.player.pm('You have no pending transfer.');
    return;
  }

  // remove the variable
  await takaro.variable.variableControllerDelete(variables[0].id);
  const pendingTransfer = JSON.parse(variables[0].value);

  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
    sender.id,
    pendingTransfer.receiver.id,
    {
      currency: pendingTransfer.amount,
    }
  );

  const receiverName = (await takaro.player.playerControllerGetOne(pendingTransfer.receiver.playerId)).data.data.name;
  const senderName = (await takaro.player.playerControllerGetOne(sender.playerId)).data.data.name;

  const messageToSender = data.player.pm(
    `You successfully transferred ${args.amount} ${currencyName} to ${receiverName}`
  );

  const messageToReceiver = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${args.amount} ${currencyName} from ${senderName}`,
    opts: {
      recipient: {
        gameId: pendingTransfer.receiver.gameId,
      },
    },
  });
  await Promise.all([messageToSender, messageToReceiver]);
  return;
}

await main();
