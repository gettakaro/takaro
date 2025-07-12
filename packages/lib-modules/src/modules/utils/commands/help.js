import { data, takaro, TakaroUserError, checkPermission } from '@takaro/helpers';
async function main() {
  const enabledModules = await takaro.module.moduleInstallationsControllerGetInstalledModules({
    filters: { gameserverId: [data.gameServerId] },
  });

  const moduleCommands = await Promise.all(
    enabledModules.data.data.map(async (mod) => {
      const installedVersion = await takaro.module.moduleVersionControllerGetModuleVersion(mod.versionId);
      return installedVersion.data.data.commands;
    }),
  );
  const allCommandsFlat = moduleCommands.flat();

  // Filter commands based on player permissions
  const accessibleCommands = allCommandsFlat.filter((command) => {
    // If command has no required permissions, it's accessible to all
    if (!command.requiredPermissions || command.requiredPermissions.length === 0) {
      return true;
    }

    // Check if player has all required permissions
    return command.requiredPermissions.every((permission) => checkPermission(data.pog, permission));
  });

  if (data.arguments.command === 'all') {
    await data.player.pm('Available commands:');

    if (accessibleCommands.length === 0) {
      await data.player.pm('No commands available to you.');
    } else {
      await Promise.all(
        accessibleCommands.map(async (command) => {
          await data.player.pm(`${command.name}: ${command.helpText}`);
        }),
      );
    }
  } else {
    const requestedCommand = allCommandsFlat.find((c) => {
      return c.name === data.arguments.command;
    });

    if (!requestedCommand) {
      throw new TakaroUserError(
        `Unknown command "${data.arguments.command}", use this command without arguments to see all available commands.`,
      );
    } else {
      // Check if player has permission to use this command
      const hasAccess =
        !requestedCommand.requiredPermissions ||
        requestedCommand.requiredPermissions.length === 0 ||
        requestedCommand.requiredPermissions.every((permission) => checkPermission(data.pog, permission));

      if (!hasAccess) {
        throw new TakaroUserError(`You don't have permission to use the "${data.arguments.command}" command.`);
      }

      await data.player.pm(`${requestedCommand.name}: ${requestedCommand.helpText}`);
    }
  }
}

await main();
