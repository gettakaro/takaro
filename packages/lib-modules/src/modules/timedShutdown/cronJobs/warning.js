import { data, takaro } from '@takaro/helpers';

async function main() {
  const { gameServerId } = data;

  const msg = data.module.userConfig.warningMessage;

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: msg,
  });
}

await main();
