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
