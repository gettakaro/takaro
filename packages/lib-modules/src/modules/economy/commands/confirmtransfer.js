import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { gameServerId, player } = data;

  // try to find a variable with key "confirmTransfer"
  const variables = (
    await takaro.variable.variableControllerSearch({
      key: 'confirmTransfer',
      gameServerId,
      moduleId: mod.moduleId,
      playerId: player.playerId,
    })
  ).data.data;

  if (variables.length === 0) {
    await data.player.pm('You have no pending transfer.');
    return;
  }

  // remove the variable
  await takaro.variable.variableControllerDelete(variables[0].id);

  const pendingTransfer = variables[0];
  const receiverPog = pendingTransfer.value.receiver.playerOnGameServer?.find(
    (pog) => pog.gameServerId === gameServerId
  );

  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
    sender,
    receiverPog.id,
    pendingTransfer.value.amount
  );

  // get playername sender and receiver (currently global player name, not gameserver specific)
  const senderName = player.name;
  const receiverName = (
    await takaro.player.playerControllerSearch({ filters: { id: pendingTransfer.value.receiver.playerId } })
  ).data.data[0].name;

  const messageToSender = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${pendingTransfer.value.amount} from ${senderName}`,
    opts: {
      recipient: {
        gameId: player.gameId,
      },
    },
  });

  const messageToReceiver = data.player.pm(`You successfully sent ${pendingTransfer.value.amount} to ${receiverName}`);
  await Promise.all([messageToSender, messageToReceiver]);
  return;
}

await main();
