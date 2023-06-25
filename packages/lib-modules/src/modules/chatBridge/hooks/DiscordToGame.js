import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  if (data.author.isBot) return;

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `[D] ${data.author.displayName}:  ${data.msg}`,
  });
}

main();
