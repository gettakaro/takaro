import { takaro, data } from '@takaro/helpers';

export function getVariableKey(tpName) {
  return `tp_${tpName}`;
}

export async function findTp(tpName, playerId) {
  const { gameServerId, module: mod } = data;

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
