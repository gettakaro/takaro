import { data, checkPermission } from '@takaro/helpers';
import { ensureWaypointsModule } from './utils.js';

async function main() {
  const { pog, gameServerId } = data;

  const { waypointsDefinition } = await ensureWaypointsModule();

  const allWaypoints = waypointsDefinition.latestVersion.commands;

  const waypointsWithPermission = allWaypoints
    .filter((waypoint) => checkPermission(pog, `WAYPOINTS_USE_${waypoint.trigger.toUpperCase()}_${gameServerId}`))
    .sort((a, b) => a.trigger.localeCompare(b.trigger));

  if (!waypointsWithPermission.length) {
    await pog.pm('There are no waypoints available.');
    return;
  }

  await pog.pm(`Available waypoints: ${waypointsWithPermission.map((waypoint) => waypoint.trigger).join(', ')}`);
}

await main();
