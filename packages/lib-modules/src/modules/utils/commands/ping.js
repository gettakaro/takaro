import { getTakaro, getData } from '@takaro/helpers';

async function ping() {
  const takaro = await getTakaro();
  const data = await getData();

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: 'Pong!',
    opts: {
      recipient: data.player,
    },
  });
}

ping();
