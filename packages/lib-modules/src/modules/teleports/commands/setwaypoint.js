import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';
import { ensureWaypointsModule, getWaypointName, waypointReconciler } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args } = data;

  if (!checkPermission(pog, 'TELEPORTS_MANAGE_WAYPOINTS')) {
    throw new TakaroUserError('You do not have permission to manage waypoints.');
  }

  const { waypointsInstallation } = await ensureWaypointsModule();

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

  await waypointReconciler();

  await pog.pm(`Waypoint ${args.waypoint} set.`);
}

await main();
