import { getTakaro, getData } from '@takaro/helpers';

async function gimme() {
  const data = await getData();

  const takaro = await getTakaro(data);

  const items = data.userConfig.items;
  const randomItem = items[Math.floor(Math.random() * items.length)];

  await takaro.gameserver.gameServerControllerGiveItem(
    data.gameServerId,
    data.player.id,
    { name: randomItem, amount: 1 }
  );
}

gimme();
