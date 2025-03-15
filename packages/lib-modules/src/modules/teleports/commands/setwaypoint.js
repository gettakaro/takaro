import { takaro, data, checkPermission, TakaroUserError } from '@takaro/helpers';
import { getWaypointName, waypointReconciler } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  if (!checkPermission(pog, 'TELEPORTS_MANAGE_WAYPOINTS')) {
    throw new TakaroUserError('You do not have permission to manage waypoints.');
  }

  try {
    await takaro.variable.variableControllerCreate({
      moduleId: mod.moduleId,
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
    throw error;
  }

  await waypointReconciler();

  await pog.pm(`Waypoint ${args.waypoint} set.`);
}

await main();
