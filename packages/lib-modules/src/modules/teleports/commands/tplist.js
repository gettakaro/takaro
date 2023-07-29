import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  const ownedTeleports = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        playerId: [player.playerId],
        moduleId: [mod.moduleId],
      },
      search: {
        key: 'tp',
      },
      sortBy: 'key',
      sortDirection: 'asc',
    })
  ).data.data;

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

    const isPublic = teleport.public && teleport.playerId !== player.playerId;
    const isOwned = ownedTeleports.find((t) => t.playerId === player.playerId);

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
