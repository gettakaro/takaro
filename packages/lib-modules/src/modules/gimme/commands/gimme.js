import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();

  const takaro = await getTakaro(data);

  const items = data.module.userConfig.items;
  const commands = data.module.userConfig.commands;

  if (items.length + commands.length === 0) {
    await data.player.pm(
      'No items or commands configured, please ask your server administrator to configure this module.'
    );
    return;
  }

  // pick a random item between 0 and the length of both the items and commands arrays
  const randomIndex = Math.floor(Math.random() * (items.length + commands.length));
  const randomOption = items.concat(commands)[randomIndex];

  if (randomIndex < items.length) {
    await takaro.gameserver.gameServerControllerGiveItem(data.gameServerId, data.player.playerId, {
      name: randomOption,
      amount: 1,
    });
    await data.player.pm(`You received ${randomOption}!`);
  } else {
    await takaro.gameserver.gameServerControllerExecuteCommand(data.gameServerId, { command: randomOption });
  }
}

await main();
