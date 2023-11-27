import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { player: sender, arguments: args, gameServerId, module: mod } = data;

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  // args.receiver has an argument type of "player". Arguments of this type are automatically resolved to the player's id.
  // If the player doesn't exist or multiple players with the same name where found, it will have thrown an error before this command is executed.
  const receiver = args.receiver;
  const senderName = (await takaro.player.playerControllerGetOne(sender.playerId)).data.data.name;
  const receiverName = (await takaro.player.playerControllerGetOne(receiver.playerId)).data.data.name;

  if (mod.userConfig.pendingAmount !== 0 && args.amount >= mod.userConfig.pendingAmount) {
    // create a variable to store confirmation requirement
    // TODO: in the future, we should probably add an expiration date to this variable.
    await takaro.variable.variableControllerCreate({
      key: 'confirmTransfer',
      value: JSON.stringify({
        amount: args.amount,
        receiver: {
          id: receiver.id,
          gameId: receiver.gameId,
          playerId: receiver.playerId,
        },
      }),
      moduleId: mod.moduleId,
      playerId: sender.playerId,
      gameServerId,
    });

    // NOTE: we should maybe check if the player has enough balance to send the amount since this is only checked when the transaction is executed.
    await sender.pm(
      `You are about to send ${args.amount} ${currencyName} to ${receiverName}. (Please confirm by typing ${prefix}confirmtransfer)`
    );
    return;
  }

  // NOTE: we don't need to check if the sender has enough balance, because the API call will fail if the sender doesn't have enough balance.
  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(sender.id, receiver.id, {
    currency: args.amount,
  });

  const messageToReceiver = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${args.amount} ${currencyName} from ${senderName}`,
    opts: {
      recipient: {
        gameId: receiver.gameId,
      },
    },
  });

  await Promise.all([
    sender.pm(`You successfully transferred ${args.amount} ${currencyName} to ${receiverName}`),
    messageToReceiver,
  ]);

  return;
}

await main();
