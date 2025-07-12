import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getWaypointName, waypointReconciler } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  try {
    await takaro.variable.variableControllerCreate({
      moduleId: mod.moduleId,
      gameServerId,
      key: getWaypointName(args.waypoint),
      value: JSON.stringify({
        x: pog.positionX,
        y: pog.positionY,
        z: pog.positionZ,
        dimension: pog.dimension,
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
