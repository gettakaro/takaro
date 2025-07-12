import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getWaypointName, waypointReconciler } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  const variable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getWaypointName(args.waypoint)],
      gameServerId: [gameServerId],
      moduleId: [mod.moduleId],
    },
  });

  if (!variable.data.data.length) {
    throw new TakaroUserError(`Waypoint ${args.waypoint} doesn't exist.`);
  }

  await takaro.variable.variableControllerDelete(variable.data.data[0].id);
  await waypointReconciler();
  await pog.pm(`Waypoint ${args.waypoint} deleted.`);
}

await main();
