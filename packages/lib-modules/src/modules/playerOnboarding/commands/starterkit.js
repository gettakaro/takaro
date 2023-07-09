import { getTakaro, getData } from '@takaro/helpers';

const VARIABLE_KEY = 't_starterkit_lock';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const items = data.module.userConfig.starterKitItems;

  if (!items.length) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: 'No starter kit items configured. Please ask your server administrator to configure this.',
    });
    return;
  }

  const starterKitLockRes = await takaro.variable.variableControllerFind({
    filters: {
      key: VARIABLE_KEY,
      gameServerId: data.gameServerId,
      playerId: data.player.playerId,
    },
  });

  if (starterKitLockRes.data.data.length > 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: 'You already used starterkit on this server',
    });
    return;
  }

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: 'You are about to receive your starter kit...',
  });

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

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `Gave ${items.length} items, enjoy!`,
  });
}

main();
