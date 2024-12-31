import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';
import { ensureWaypointsModule, getWaypointName } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args } = data;

  if (!checkPermission(pog, 'TELEPORTS_MANAGE_WAYPOINTS')) {
    throw new TakaroUserError('You do not have permission to manage waypoints.');
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
