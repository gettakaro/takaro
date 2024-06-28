import { takaro, data } from '@takaro/helpers';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data.value;

  const maybePublicTeleports = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
      },
      search: {
        key: ['tp'],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    })
  ).data.data;

  const teleports = maybePublicTeleports.filter((tele) => {
    const teleport = JSON.parse(tele.value);

    const isPublic = teleport.public && teleport.playerId !== pog.playerId;
    const isOwned = tele.playerId === pog.playerId;

    return isPublic || isOwned;
  });

  if (teleports.length === 0) {
    await data.player.pm(`You have no teleports set, use ${prefix}settp <name> to set one.`);
    return;
  }

  await data.player.pm(`You have ${teleports.length} teleport${teleports.length === 1 ? '' : 's'} available`);

  for (const rawTeleport of teleports) {
    const teleport = JSON.parse(rawTeleport.value);
    await data.player.pm(
      ` - ${teleport.name}: ${teleport.x}, ${teleport.y}, ${teleport.z} ${teleport.public ? '(public)' : ''}`
    );
  }
}

await main();
