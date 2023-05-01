import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: 'Automated message :)',
  });
}

main();
