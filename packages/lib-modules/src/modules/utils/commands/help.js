import { data, takaro, TakaroUserError } from '@takaro/helpers';
async function main() {
  const enabledModules = await takaro.module.moduleInstallationsControllerGetInstalledModules({
    filters: { gameServerId: [data.gameServerId] },
  });

  const moduleCommands = await Promise.all(
    enabledModules.data.data.map(async (mod) => {
      const installedVersion = await takaro.module.moduleVersionControllerGetModuleVersion(mod.versionId);
      return installedVersion.data.data.commands;
    }),
  );
  const allCommandsFlat = moduleCommands.flat();

  if (data.arguments.command === 'all') {
    await data.player.pm('Available commands:');

    await Promise.all(
      allCommandsFlat.map(async (command) => {
        await data.player.pm(`${command.name}: ${command.helpText}`);
      }),
    );
  } else {
    const requestedCommand = allCommandsFlat.find((c) => {
      return c.name === data.arguments.command;
    });

    if (!requestedCommand) {
      throw new TakaroUserError(
        `Unknown command "${data.arguments.command}", use this command without arguments to see all available commands.`,
      );
    } else {
      await data.player.pm(`${requestedCommand.name}: ${requestedCommand.helpText}`);
    }
  }
}

await main();
