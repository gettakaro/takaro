import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const rawMessage = data.module.config.message;
  const message = rawMessage.replace('{player}', player.name);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message,
  });
}

main();
