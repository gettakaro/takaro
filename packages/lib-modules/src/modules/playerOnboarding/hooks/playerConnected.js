import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.eventData.player;

  const rawMessage = data.module.userConfig.message;
  const message = rawMessage.replace('{player}', player.name);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message,
  });
}

await main();
