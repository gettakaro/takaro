import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, arguments: args, module: mod } = data;

  const ownedTeleportRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [`tp_${args.tp}`],
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  let teleports = ownedTeleportRes.data.data;

  if (mod.userConfig.allowPublicTeleports) {
    const maybePublicTeleportRes = await takaro.variable.variableControllerSearch({
      filters: {
        key: [`tp_${args.tp}`],
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    });

    const publicTeleports = maybePublicTeleportRes.data.data.filter((tele) => {
      const teleport = JSON.parse(tele.value);
      return teleport.public;
    });

    teleports = teleports.concat(publicTeleports);
  }

  if (teleports.length === 0) {
    await data.player.pm(`Teleport ${args.tp} does not exist.`);
    return;
  }

  const timeout = mod.userConfig.timeout;

  const lastExecuted = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['lastExecuted'],
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });
  const lastExecutedRecord = lastExecuted.data.data[0];

  if (!lastExecutedRecord) {
    await takaro.variable.variableControllerCreate({
      key: 'lastExecuted',
      gameServerId,
      playerId: player.playerId,
      moduleId: mod.moduleId,
      value: new Date().toISOString(),
    });
  } else {
    const lastExecutedTime = new Date(lastExecutedRecord.value);
    const now = new Date();

    const diff = now.getTime() - lastExecutedTime.getTime();

    if (diff < timeout) {
      await data.player.pm('You cannot teleport yet. Please wait before trying again.');
      return;
    }
  }

  const teleport = JSON.parse(teleports[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, player.playerId, {
    x: teleport.x,
    y: teleport.y,
    z: teleport.z,
  });

  await data.player.pm(`Teleported to ${teleport.name}.`);

  await takaro.variable.variableControllerUpdate(lastExecutedRecord.id, {
    value: new Date().toISOString(),
  });
}

await main();
