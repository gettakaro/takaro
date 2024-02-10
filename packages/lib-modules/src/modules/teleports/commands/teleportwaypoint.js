import { getTakaro, getData, TakaroUserError, checkPermission } from '@takaro/helpers';

function getWaypointName(name) {
  return `waypoint ${name}`;
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { pog, gameServerId, trigger } = data;

  if (!checkPermission(pog, `WAYPOINTS_USE_${trigger.toUpperCase()}_${gameServerId}`)) {
    throw new TakaroUserError(`You are not allowed to use the waypoint ${trigger}.`);
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
      await takaro.gameserver.gameServerControllerGetInstalledModules(gameServerId)
    ).data.data.find((module) => module.name === 'Waypoints');

    if (!waypointsInstallation) {
      console.log('Waypoints module not found, installing it.');
      waypointsInstallation = (
        await takaro.gameserver.gameServerControllerInstallModule(gameServerId, waypointsDefinition.id)
      ).data.data;
    }

    return { waypointsInstallation, waypointsDefinition };
  }

  const { waypointsInstallation } = await ensureWaypointsModule();

  const variable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getWaypointName(trigger)],
      gameServerId: [gameServerId],
      moduleId: [waypointsInstallation.moduleId],
    },
  });

  if (variable.data.data.length === 0) {
    throw new TakaroUserError(`Waypoint ${trigger} does not exist.`);
  }

  const waypoint = JSON.parse(variable.data.data[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, pog.playerId, {
    x: waypoint.x,
    y: waypoint.y,
    z: waypoint.z,
  });

  await pog.pm(`Teleported to waypoint ${trigger}.`);
}

await main();
