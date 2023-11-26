import { getTakaro, getData, TakaroUserError } from '@takaro/helpers';

const VARIABLE_KEY = 't_starterkit_lock';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const items = data.module.userConfig.starterKitItems;

  if (!items.length) {
    throw new TakaroUserError(
      'No starter kit items configured. Please ask your server administrator to configure this.'
    );
  }

  const starterKitLockRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [VARIABLE_KEY],
      gameServerId: [data.gameServerId],
      playerId: [data.player.playerId],
    },
  });

  if (starterKitLockRes.data.data.length > 0) {
    throw new TakaroUserError('You already used starterkit on this server');
  }

  await data.player.pm('You are about to receive your starter kit...');

  await Promise.all(
    items.map(async (item) => {
      return takaro.gameserver.gameServerControllerGiveItem(data.gameServerId, data.player.playerId, {
        name: item,
        amount: 1,
      });
    })
  );

  await takaro.variable.variableControllerCreate({
    key: VARIABLE_KEY,
    value: '1',
    gameServerId: data.gameServerId,
    playerId: data.player.playerId,
  });

  await data.player.pm(`Gave ${items.length} items, enjoy!`);
}

await main();
