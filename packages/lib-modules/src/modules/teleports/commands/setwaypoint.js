import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';
import { ensureWaypointsModule, getWaypointName } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod, arguments: args } = data;

  if (!checkPermission(pog, 'TELEPORTS_MANAGE_WAYPOINTS')) {
    throw new TakaroUserError('You do not have permission to manage waypoints.');
  }

  const { waypointsInstallation, waypointsDefinition } = await ensureWaypointsModule();

  try {
    await takaro.variable.variableControllerCreate({
      moduleId: waypointsInstallation.moduleId,
      gameServerId,
      key: getWaypointName(args.waypoint),
      value: JSON.stringify({
        x: pog.positionX,
        y: pog.positionY,
        z: pog.positionZ,
      }),
    });
  } catch (error) {
    if (error.message === 'Request failed with status code 409') {
      throw new TakaroUserError(`Waypoint ${args.waypoint} already exists.`);
    }
  }

  const teleportCommand = await takaro.command.commandControllerSearch({
    filters: {
      moduleId: [mod.moduleId],
      name: ['teleportwaypoint'],
    },
  });

  await takaro.command.commandControllerCreate({
    versionId: waypointsInstallation.versionId,
    name: `waypoint ${args.waypoint} server ${gameServerId}`,
    trigger: args.waypoint,
    helpText: `Teleport to waypoint ${args.waypoint}.`,
    function: teleportCommand.data.data[0].function.code,
  });

  const existingPermissions = waypointsDefinition.latestVersion.permissions || [];
  const permissionInputDTOs = existingPermissions.map((permission) => ({
    permission: permission.permission,
    description: permission.description,
    friendlyName: permission.friendlyName,
    canHaveCount: permission.canHaveCount,
  }));

  const gameServer = (await takaro.gameserver.gameServerControllerGetOne(gameServerId)).data.data;

  await takaro.module.moduleControllerUpdate(waypointsInstallation.moduleId, {
    latestVersion: {
      permissions: [
        {
          permission: `WAYPOINTS_USE_${args.waypoint.toUpperCase()}_${gameServerId}`,
          description: `Use the waypoint ${args.waypoint} on ${gameServer.name}.`,
          friendlyName: `Use waypoint ${args.waypoint} on ${gameServer.name}`,
          canHaveCount: false,
        },
        ...permissionInputDTOs,
      ],
    },
  });

  // Need to reinstall the module to ensure the new commands systemconfig and permissions are properly in place
  await takaro.module.moduleInstallationsControllerInstallModule({
    gameServerId,
    versionId: waypointsInstallation.versionId,
    systemConfig: JSON.stringify(waypointsInstallation.systemConfig),
    userConfig: JSON.stringify(waypointsInstallation.userConfig),
  });

  await pog.pm(`Waypoint ${args.waypoint} set.`);
}

await main();
