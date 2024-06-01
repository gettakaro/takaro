import { takaro, data } from '@takaro/helpers';

async function main() {
  const randomMessage =
    data.module.userConfig.messages[Math.floor(Math.random() * data.module.userConfig.messages.length)];

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: randomMessage,
  });
}

await main();
