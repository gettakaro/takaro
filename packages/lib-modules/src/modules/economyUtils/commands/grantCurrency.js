import { takaro, data } from '@takaro/helpers';

async function main() {
  const { pog: granter, arguments: args, gameServerId } = data;

  // args.receiver has an argument type of "player". Arguments of this type are automatically resolved to the player's id.
  // If the player doesn't exist or multiple players with the same name where found, it will have thrown an error before this command is executed.
  const receiver = args.receiver;

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data.value;
  const granterName = (await takaro.player.playerControllerGetOne(granter.playerId)).data.data.name;
  const receiverName = (await takaro.player.playerControllerGetOne(receiver.playerId)).data.data.name;
  await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(receiver.gameServerId, receiver.playerId, {
    currency: args.amount,
    source: 'adminGrant',
  });

  const messageToReceiver = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Granted ${args.amount} ${currencyName} by ${granterName}`,
    opts: {
      recipient: {
        gameId: receiver.gameId,
      },
    },
  });

  await Promise.all([
    granter.pm(`You successfully granted ${args.amount} ${currencyName} to ${receiverName}`),
    messageToReceiver,
  ]);

  return;
}

await main();
