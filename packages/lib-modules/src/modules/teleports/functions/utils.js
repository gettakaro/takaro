import { takaro, data } from '@takaro/helpers';

export function getVariableKey(tpName, pub = false) {
  if (pub && tpName) return `pubtp_${tpName}`;
  if (pub && !tpName) return 'pubtp_';
  if (tpName) return `tp_${tpName}`;
  return 'tp_';
}

export async function findTp(tpName, playerId, pub = false) {
  const { gameServerId, module: mod } = data;

  if (pub) {
    return takaro.variable.variableControllerSearch({
      filters: {
        key: [getVariableKey(tpName, true)],
        gameServerId: [gameServerId],
        playerId: [playerId].filter(Boolean),
        moduleId: [mod.moduleId],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    });
  }

  return takaro.variable.variableControllerSearch({
    filters: {
      key: [getVariableKey(tpName)],
      gameServerId: [gameServerId],
      playerId: [playerId].filter(Boolean),
      moduleId: [mod.moduleId],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });
}

export async function ensureWaypointsModule() {
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
      })
    ).data.data;
  }

  let waypointsInstallation = (
    await takaro.module.moduleInstallationsControllerGetInstalledModules({
      filters: { gameserverId: [data.gameServerId] },
    })
  ).data.data.find((module) => module.name === 'Waypoints');

  if (!waypointsInstallation) {
    console.log('Waypoints module not found, installing it.');
    waypointsInstallation = (
      await takaro.module.moduleInstallationsControllerInstallModule({
        gameServerId: data.gameServerId,
        versionId: waypointsDefinition.latestVersion.id,
      })
    ).data.data;
  }

  return { waypointsInstallation, waypointsDefinition };
}

export function getWaypointName(name) {
  return `waypoint ${name}`;
}
