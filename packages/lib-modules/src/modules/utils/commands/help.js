import { getTakaro, getData } from '@takaro/helpers';

async function help() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const enabledModules =
    await takaro.gameserver.gameServerControllerGetInstalledModules(
      data.gameServerId
    );
  const moduleCommands = enabledModules.data.data.map((mod) => {
    return mod.commands;
  });

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: 'Available commands:',
  });

  for (const mod of moduleCommands) {
    await Promise.all(
      mod.map(async (command) => {
        await takaro.gameserver.gameServerControllerSendMessage(
          data.gameServerId,
          {
            message: `${command.name}: ${command.helpText}`,
          }
        );
      })
    );
  }
}

help();
