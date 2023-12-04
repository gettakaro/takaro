import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { player: granter, arguments: args, gameServerId } = data;

  // args.receiver has an argument type of "player". Arguments of this type are automatically resolved to the player's id.
  // If the player doesn't exist or multiple players with the same name where found, it will have thrown an error before this command is executed.
  const receiver = args.receiver;

  if (!checkPermission(granter, 'ECONOMY_MANAGE_CURRENCY')) {
    throw new TakaroUserError('You do not have permission to use grant currency command.');
  }

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;
  const granterName = (await takaro.player.playerControllerGetOne(granter.playerId)).data.data.name;
  const receiverName = (await takaro.player.playerControllerGetOne(receiver.playerId)).data.data.name;
  await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(receiver.id, { currency: args.amount });

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
