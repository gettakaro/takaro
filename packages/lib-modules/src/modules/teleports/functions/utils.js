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
  const { gameServerId } = data;
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
      filters: { gameserverId: [gameServerId] },
    })
  ).data.data.find((module) => module.module.name === 'Waypoints');

  if (!waypointsInstallation) {
    console.log('Waypoints installation not found, installing it.');
    waypointsInstallation = (
      await takaro.module.moduleInstallationsControllerInstallModule({
        gameServerId,
        versionId: waypointsDefinition.latestVersion.id,
      })
    ).data.data;
  }

  return { waypointsInstallation, waypointsDefinition };
}

export function getWaypointName(name) {
  return `waypoint ${name}`;
}

export function getWaypointId(varName) {
  const split = varName.split(' ')[1];
  if (split) return split;
  return varName;
}

/**
 * This function is responsible to read all the configured waypoints (vars)
 * and then ensuring that the waypoints module has the correct config
 */
export async function waypointReconciler() {
  console.log('Reconciling waypoints');
  const { waypointsInstallation, waypointsDefinition } = await ensureWaypointsModule();
  const { gameServerId, module: mod } = data;

  // Get all the installed waypoints
  const waypointVars = (
    await takaro.variable.variableControllerSearch({
      filters: {
        moduleId: [mod.moduleId],
        gameServerId: [gameServerId],
      },
      search: {
        key: [getWaypointName('')],
      },
    })
  ).data.data;

  const waypointsInModule = waypointsDefinition.latestVersion.commands;

  // Check if any waypoints are missing in module
  const missingWaypoints = waypointVars.filter((waypointVar) => {
    const existingWaypointsForServer = waypointsInModule.filter((waypoint) => waypoint.name.includes(gameServerId));
    return !existingWaypointsForServer.some((waypoint) => waypoint.trigger === getWaypointId(waypointVar.key));
  });

  // Check if there are waypoints too many in module compared to our vars
  const toDeleteWaypoints = waypointsInModule.filter((waypoint) => {
    // We ignore any commands that are not for this game server
    if (!waypoint.name.includes(gameServerId)) return false;
    return !waypointVars.some((waypointVar) => getWaypointId(waypointVar.key) === waypoint.trigger);
  });

  if (!missingWaypoints.length && !toDeleteWaypoints.length) {
    // No changes in waypoints, exit
    return;
  }

  console.log(
    'Missing waypoints:',
    missingWaypoints.map((waypoint) => waypoint.key),
  );
  console.log(
    'To delete waypoints:',
    toDeleteWaypoints.map((waypoint) => waypoint.trigger),
  );

  // Fetch the teleporting code template
  const teleportCommand = await takaro.command.commandControllerSearch({
    filters: {
      moduleId: [mod.moduleId],
      name: ['teleportwaypoint'],
    },
  });

  // Edit the module accordingly
  await Promise.all([
    ...missingWaypoints.map((waypoint) => {
      return takaro.command.commandControllerCreate({
        name: `waypoint ${getWaypointId(waypoint.key)} server ${gameServerId}`,
        trigger: getWaypointId(waypoint.key),
        helpText: `Teleport to waypoint ${getWaypointId(waypoint.key)}.`,
        function: teleportCommand.data.data[0].function.code,
        versionId: waypointsInstallation.versionId,
      });
    }),
    ...toDeleteWaypoints.map((waypointVar) => {
      return takaro.command.commandControllerRemove(waypointVar.id);
    }),
  ]);

  // Update permissions
  const existingPermissions = waypointsDefinition.latestVersion.permissions || [];
  const permissionInputDTOs = existingPermissions.map((permission) => ({
    permission: permission.permission,
    description: permission.description,
    friendlyName: permission.friendlyName,
    canHaveCount: permission.canHaveCount,
  }));
  // We need to filter out the permissions we deleted in the above lines
  const filteredPermissionsInputs = permissionInputDTOs.filter((permission) => {
    return !toDeleteWaypoints.some(
      (waypoint) => permission.permission === `WAYPOINTS_USE_${waypoint.trigger.toUpperCase()}_${gameServerId}`,
    );
  });
  const gameServer = (await takaro.gameserver.gameServerControllerGetOne(gameServerId)).data.data;
  await takaro.module.moduleControllerUpdate(waypointsInstallation.moduleId, {
    latestVersion: {
      permissions: [
        ...filteredPermissionsInputs,
        ...missingWaypoints.map((waypoint) => ({
          permission: `WAYPOINTS_USE_${getWaypointId(waypoint.key).toUpperCase()}_${gameServerId}`,
          description: `Use the waypoint ${getWaypointId(waypoint.key)} on ${gameServer.name}.`,
          friendlyName: `Use waypoint ${getWaypointId(waypoint.key)} on ${gameServer.name}`,
          canHaveCount: false,
        })),
      ],
    },
  });
}
