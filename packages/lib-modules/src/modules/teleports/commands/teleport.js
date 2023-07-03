import { getTakaro, getData } from '@takaro/helpers';

async function teleport() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, arguments: args, module: mod } = data;

  const ownedTeleportRes = await takaro.variable.variableControllerFind({
    filters: {
      key: `t_tp_${args.tp}`,
      gameServerId,
      playerId: player.id,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  let teleports = ownedTeleportRes.data.data;

  if (mod.userConfig.allowPublicTeleports) {
    const maybePublicTeleportRes = await takaro.variable.variableControllerFind({
      filters: {
        key: `t_tp_${args.tp}`,
        gameServerId,
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
    });
    return;
  }

  const timeout = mod.userConfig.timeout;

  const lastExecuted = await takaro.variable.variableControllerFind({
    filters: {
      key: `t_tp_${args.tp}_lastExecuted`,
      gameServerId,
      playerId: player.id,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  if (lastExecuted.data.data.length === 0) {
    await takaro.variable.variableControllerCreate({
      key: `t_tp_${args.tp}_lastExecuted`,
      gameServerId,
      playerId: player.id,
      value: new Date().toISOString(),
    });
  } else {
    const lastExecutedTime = new Date(lastExecuted.data.data[0].value);
    const now = new Date();

    const diff = now.getTime() - lastExecutedTime.getTime();

    if (diff < timeout) {
      await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
        message: 'You cannot teleport yet. Please wait before trying again.',
      });
      return;
    }
  }

  const teleport = JSON.parse(teleports[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, player.id, {
    x: teleport.x,
    y: teleport.y,
    z: teleport.z,
  });

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Teleported to ${teleport.name}.`,
  });
}

teleport();
