import { takaro, data } from '@takaro/helpers';

async function main() {
  const { pog: revoker, arguments: args, gameServerId } = data;

  // args.receiver has an argument type of "player". Arguments of this type are automatically resolved to the player's id.
  // If the player doesn't exist or multiple players with the same name where found, it will have thrown an error before this command is executed.
  const receiver = args.receiver;

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data.value;
  const revokerName = (await takaro.player.playerControllerGetOne(revoker.playerId)).data.data.name;
  const receiverName = (await takaro.player.playerControllerGetOne(receiver.playerId)).data.data.name;
  await takaro.playerOnGameserver.playerOnGameServerControllerDeductCurrency(receiver.gameServerId, receiver.playerId, {
    currency: args.amount,
  });

  const messageToReceiver = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `${args.amount} ${currencyName} were revoked by ${revokerName}`,
    opts: {
      recipient: {
        gameId: receiver.gameId,
      },
    },
  });

  await Promise.all([
    revoker.pm(`You successfully revoked ${args.amount} ${currencyName} of ${receiverName}'s balance`),
    messageToReceiver,
  ]);

  return;
}

await main();
