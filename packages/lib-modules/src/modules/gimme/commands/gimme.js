import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const items = data.module.userConfig.items;
  const commands = data.module.userConfig.commands;

  if (items.length + commands.length === 0) {
    throw new TakaroUserError(
      'No items or commands configured, please ask your server administrator to configure this module.',
    );
  }

  // pick a random item between 0 and the length of both the items and commands arrays
  const randomIndex = Math.floor(Math.random() * (items.length + commands.length));
  const randomOption = items.concat(commands)[randomIndex];

  if (randomIndex < items.length) {
    const item = (await takaro.item.itemControllerFindOne(randomOption.item)).data.data;
    await takaro.gameserver.gameServerControllerGiveItem(data.gameServerId, data.player.id, {
      name: randomOption.item,
      amount: randomOption.amount,
      quality: randomOption.quality ?? '',
    });
    await data.player.pm(`You received ${randomOption.amount}x ${item.name}!`);
  } else {
    await takaro.gameserver.gameServerControllerExecuteCommand(data.gameServerId, { command: randomOption });
  }
}

await main();
