import { getTakaro, getData } from '@takaro/helpers';

// TODO: set max amount that can be transferred as variable

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const { playerOnGameServer, arguments: args, gameServerId } = data;

  // try to find playerOnGameServer with name provided in args.
  const sender = playerOnGameServer.id;
  // TODO: There is currently no way to search for a playerOnGameServer by name.
  const receiver = 'receiver-id';

  // NOTE: we don't need to check if the sender has enough balance, because the API call will fail if the sender doesn't have enough balance.
  await takaro.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(sender, receiver, args.amount);

  const messageToSender = takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You received ${args.amount} from ${sender}`,
    opts: {
      recipient: {
        gameId: player.gameId,
      },
    },
  });
  const messageToReceiver = data.player.pm(`You successfully sent ${args.amount} to ${receiver}`);
  // send messages simultaneously
  await Promise.all([messageToSender, messageToReceiver]);

  return;
}

await main();
