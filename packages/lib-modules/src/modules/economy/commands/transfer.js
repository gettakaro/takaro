import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { player, arguments: args, gameServerId, module: mod } = data;

  // try to find playerOnGameServer with name provided in args.
  const sender = player.id;

  // args.receiver has an argument type of "player". Arguments of this type are automatically resolved to the player's id.
  // If the player doesn't exist or multiple players with the same name where found, it will have thrown an error before this command is executed.
  const receiver = args.receiver;

  if (mod.userConfig.pendingTransfer !== 0 && amount >= mod.userConfig.pendingTransfer) {
    // create a variable to store confirmation requirement
    // TODO: in the future, we should probably add an expiration date to this variable.
    await takaro.variable.variableControllerCreate({
      key: 'confirmTransfer',
      gameServerId,
      data: JSON.stringify({
        amount: args.amount,
        receiver: args.receiver,
      }),
      moduleId: mod.moduleId,
      playerId: player.playerId,
    });

    // NOTE: we should maybe check if the player has enough balance to send the amount since this is only checked when the transaction is executed.
    await data.player.pm(
      `You are about to send ${args.amount} to ${receiver.name}. (Please confirm by typing /confirmtransfer)`
    );
  }

  const receiverPog = receiver.playerOnGameServer?.find((pog) => pog.gameServerId === gameServerId);

  // NOTE: we don't need to check if the sender has enough balance, because the API call will fail if the sender doesn't have enough balance.
  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
    sender,
    receiverPog.id,
    args.amount
  );

  // get playername sender and receiver (currently global player name, not gameserver specific)
  const senderName = player.name;

  const messageToSender = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${args.amount} from ${senderName}`,
    opts: {
      recipient: {
        gameId: player.gameId,
      },
    },
  });

  const messageToReceiver = data.player.pm(`You successfully transferred ${args.amount} to ${receiver.name}`);
  // send messages simultaneously
  await Promise.all([messageToSender, messageToReceiver]);

  return;
}

await main();
