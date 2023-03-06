import { getTakaro, getData } from '@takaro/helpers';

async function ping() {
  const takaro = await getTakaro();
  const data = await getData();

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: 'Pong!',
    opts: {
      recipient: data.player,
    },
  });
}

ping();
