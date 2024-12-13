import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';

function getWaypointName(name) {
  return `waypoint ${name}`;
}

async function main() {
  const { pog, gameServerId, arguments: args } = data;

  if (!checkPermission(pog, 'TELEPORTS_MANAGE_WAYPOINTS')) {
    throw new TakaroUserError('You do not have permission to manage waypoints.');
  }

  async function ensureWaypointsModule() {
    let waypointsDefinition = (
      await takaro.module.moduleControllerSearch({
        filters: {
          name: ['Waypoints'],
        },
      })
    ).data.data[0];

    if (!waypointsDefinition) {
      console.log('Waypoints module definition not found, creating it.');
      waypointsDefinition = (
        await takaro.module.moduleControllerCreate({
          name: 'Waypoints',
          description: 'Waypoints module for the teleport system.',
        })
      ).data.data;
    }

    let waypointsInstallation = (
      await takaro.module.moduleInstallationsControllerGetInstalledModules({
        filters: { gameServerId: [gameServerId] },
      })
    ).data.data.find((module) => module.name === 'Waypoints');

    if (!waypointsInstallation) {
      console.log('Waypoints module not found, installing it.');
      waypointsInstallation = (
        await takaro.module.moduleInstallationsControllerInstallModule({
          gameServerId,
          versionId: waypointsDefinition.latestVersion.id,
        })
      ).data.data;
    }

    return { waypointsInstallation, waypointsDefinition };
  }

  const { waypointsInstallation } = await ensureWaypointsModule();

  const variable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getWaypointName(args.waypoint)],
      gameServerId: [gameServerId],
      moduleId: [waypointsInstallation.moduleId],
    },
  });

  if (!variable.data.data.length) {
    throw new TakaroUserError(`Waypoint ${args.waypoint} doesn't exist.`);
  }

  await takaro.variable.variableControllerDelete(variable.data.data[0].id);

  const teleportCommand = await takaro.command.commandControllerSearch({
    filters: {
      moduleId: [waypointsInstallation.moduleId],
      name: [`waypoint ${args.waypoint} server ${gameServerId}`],
    },
  });

  if (teleportCommand.data.data.length) {
    await takaro.command.commandControllerRemove(teleportCommand.data.data[0].id);
  }

  await pog.pm(`Waypoint ${args.waypoint} deleted.`);
}

await main();
