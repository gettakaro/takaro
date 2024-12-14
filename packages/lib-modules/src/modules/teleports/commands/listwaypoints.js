import { takaro, data, checkPermission } from '@takaro/helpers';

async function main() {
  const { pog, gameServerId } = data;

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

  const { waypointsDefinition } = await ensureWaypointsModule();

  const allWaypoints = waypointsDefinition.commands;

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
