import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player } = data;

  const rawMessage = data.module.userConfig.message;
  const message = rawMessage.replace('{player}', player.name);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message,
  });
}

await main();
