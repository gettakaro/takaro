import { getTakaro, getData } from '@takaro/helpers';

async function gimme() {
  const data = await getData();

  const takaro = await getTakaro(data);

  const items = data.module.userConfig.items;
  const commands = data.module.userConfig.commands;

  // pick a random item between 0 and the length of both the items and commands arrays
  const randomIndex = Math.floor(
    Math.random() * (items.length + commands.length)
  );
  const randomOption = items.concat(commands)[randomIndex];

  if (randomIndex < items.length) {
    await takaro.gameserver.gameServerControllerGiveItem(
      data.gameServerId,
      data.player.id,
      { name: randomOption, amount: 1 }
    );
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `You received ${randomOption}!`,
    });
  } else {
    await takaro.gameserver.gameServerControllerExecuteCommand(
      data.gameServerId,
      { command: randomOption }
    );
  }
}

gimme();
