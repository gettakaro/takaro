import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { gameServerId, pog: sender, module: mod } = data;

  // try to find a variable with key "confirmTransfer"
  const variables = (
    await takaro.variable.variableControllerSearch({
      filters: {
        key: ['confirmTransfer'],
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
        playerId: [sender.playerId],
      },
    })
  ).data.data;

  if (variables.length === 0) {
    throw new TakaroUserError('You have no pending transfer.');
  }

  // Remove the variable before potentially executing the transaction.
  await takaro.variable.variableControllerDelete(variables[0].id);
  const pendingTransfer = JSON.parse(variables[0].value);

  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
    sender.gameServerId,
    sender.id,
    pendingTransfer.receiver.id,
    {
      currency: pendingTransfer.amount,
    },
  );

  const receiverName = (await takaro.player.playerControllerGetOne(pendingTransfer.receiver.playerId)).data.data.name;
  const senderName = (await takaro.player.playerControllerGetOne(sender.playerId)).data.data.name;
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data.value;

  const messageToSender = sender.pm(
    `You successfully transferred ${pendingTransfer.amount} ${currencyName} to ${receiverName}`,
  );

  const messageToReceiver = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${pendingTransfer.amount} ${currencyName} from ${senderName}`,
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
