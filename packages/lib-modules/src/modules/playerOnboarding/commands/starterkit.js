import { takaro, data, TakaroUserError } from '@takaro/helpers';

const VARIABLE_KEY = 't_starterkit_lock';

async function main() {
  const items = data.module.userConfig.starterKitItems;

  if (!items || items.length === 0) {
    throw new TakaroUserError(
      'No starter kit items configured. Please ask your server administrator to configure this.',
    );
  }

  const starterKitLockRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [VARIABLE_KEY],
      gameServerId: [data.gameServerId],
      playerId: [data.player.id],
    },
  });

  if (starterKitLockRes.data.data.length > 0) {
    throw new TakaroUserError('You already used starterkit on this server');
  }

  await data.player.pm('You are about to receive your starter kit...');

  const itemRecords = (await takaro.item.itemControllerSearch({ filters: { id: items.map((_) => _.item) } })).data.data;
  const fullItems = items.map((item) => {
    const itemRecord = itemRecords.find((record) => record.id === item.item);
    if (!itemRecord) {
      throw new TakaroUserError(`Item with ID ${item.item} not found.`);
    }
    return {
      code: itemRecord.code,
      quality: item.quality,
      amount: item.amount,
    };
  });

  await Promise.all(
    fullItems.map(async (item) => {
      return takaro.gameserver.gameServerControllerGiveItem(data.gameServerId, data.player.id, {
        name: item.code,
        quality: item.quality ?? '',
        amount: item.amount,
      });
    }),
  );

  await takaro.variable.variableControllerCreate({
    key: VARIABLE_KEY,
    value: '1',
    gameServerId: data.gameServerId,
    playerId: data.player.id,
  });

  await data.player.pm(`Gave ${items.length} items, enjoy!`);
}

await main();
