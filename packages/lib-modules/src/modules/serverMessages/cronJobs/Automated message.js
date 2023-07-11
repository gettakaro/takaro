import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const randomMessage =
    data.module.userConfig.messages[Math.floor(Math.random() * data.module.userConfig.messages.length)];

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: randomMessage,
  });
}

await main();
