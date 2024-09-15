import { data, takaro } from '@takaro/helpers';

async function main() {
  const { gameServerId } = data;
  await takaro.gameserver.gameServerControllerShutdown(gameServerId);
}

await main();
