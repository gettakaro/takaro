import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  if (data.eventData.author.isBot) return;

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `[D] ${data.eventData.author.displayName}:  ${data.eventData.msg}`,
  });
}

main();
