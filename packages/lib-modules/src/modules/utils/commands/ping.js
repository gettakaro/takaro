import { getTakaro, getData } from '@takaro/helpers';

async function ping() {
  const data = await getData();
  const takaro = await getTakaro(data);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: 'Pong!',
    opts: {
      recipient: {
        gameId: data.player.gameId,
      },
    },
  });
}

ping();
