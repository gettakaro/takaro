import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, arguments: args, module: mod } = data;

  const ownedTeleportRes = await takaro.variable.variableControllerFind({
    filters: {
      key: `tp_${args.tp}`,
      gameServerId,
      playerId: player.playerId,
      moduleId: mod.moduleId,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  let teleports = ownedTeleportRes.data.data;

  if (mod.userConfig.allowPublicTeleports) {
    const maybePublicTeleportRes = await takaro.variable.variableControllerFind({
      filters: {
        key: `tp_${args.tp}`,
        gameServerId,
        moduleId: mod.moduleId,
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
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `Teleport ${args.tp} does not exist.`,
      opts: {
        recipient: {
          gameId: player.gameId,
        },
      },
    });
    return;
  }

  const timeout = mod.userConfig.timeout;

  const lastExecuted = await takaro.variable.variableControllerFind({
    filters: {
      key: 'lastExecuted',
      gameServerId,
      playerId: player.playerId,
      moduleId: mod.moduleId,
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
      await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
        message: 'You cannot teleport yet. Please wait before trying again.',
        opts: {
          recipient: {
            gameId: player.gameId,
          },
        },
      });
      return;
    }
  }

  const teleport = JSON.parse(teleports[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, player.playerId, {
    x: teleport.x,
    y: teleport.y,
    z: teleport.z,
  });

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Teleported to ${teleport.name}.`,
    opts: {
      recipient: {
        gameId: player.gameId,
      },
    },
  });

  await takaro.variable.variableControllerUpdate(lastExecutedRecord.id, {
    value: new Date().toISOString(),
  });
}

await main();
