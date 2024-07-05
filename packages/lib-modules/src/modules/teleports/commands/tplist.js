import { takaro, data } from '@takaro/helpers';
import { getVariableKey } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data.value;

  const ownedTeleports = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        playerId: [pog.playerId],
        moduleId: [mod.moduleId],
      },
      search: {
        key: [getVariableKey(undefined, false)],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    })
  ).data.data;

  const publicTeleports = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
      },
      search: {
        key: [getVariableKey(undefined, true)],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    })
  ).data.data
    // Filter out public teleports that are owned by the player
    // Since we'll be showing them in the owned teleports list
    .filter((teleport) => {
      return teleport.playerId !== pog.playerId;
    });

  const teleports = [...ownedTeleports, ...publicTeleports];

  if (teleports.length === 0) {
    await data.player.pm(`You have no teleports available, use ${prefix}settp <name> to set one.`);
    return;
  }

  await data.player.pm(`You have ${teleports.length} teleport${teleports.length === 1 ? '' : 's'} available`);

  for (const rawTeleport of teleports) {
    const teleport = JSON.parse(rawTeleport.value);
    await data.player.pm(
      `${teleport.name}: (${teleport.x},${teleport.y},${teleport.z}) ${
        rawTeleport.key.startsWith('pub') ? '(public)' : ''
      }`
    );
  }
}

await main();
