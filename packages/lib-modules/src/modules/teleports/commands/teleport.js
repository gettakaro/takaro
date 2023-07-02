import { getTakaro, getData } from '@takaro/helpers';

async function teleport() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const tpPoint = await takaro.variable.variableControllerFind({
    filters: {
      key: `t_tp_${data.arguments.tp}`,
      gameServerId: data.gameServerId,
      playerId: player.id,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  if (tpPoint.data.data.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `Teleport ${data.arguments.tp} does not exist.`,
    });
    return;
  }

  const timeout = data.module.userConfig.timeout;

  const lastExecuted = await takaro.variable.variableControllerFind({
    filters: {
      key: `t_tp_${data.arguments.tp}_lastExecuted`,
      gameServerId: data.gameServerId,
      playerId: player.id,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  if (lastExecuted.data.data.length === 0) {
    await takaro.variable.variableControllerCreate({
      key: `t_tp_${data.arguments.tp}_lastExecuted`,
      gameServerId: data.gameServerId,
      playerId: player.id,
      value: new Date().toISOString(),
    });
  } else {
    const lastExecutedTime = new Date(lastExecuted.data.data[0].value);
    const now = new Date();

    const diff = now.getTime() - lastExecutedTime.getTime();

    if (diff < timeout) {
      await takaro.gameserver.gameServerControllerSendMessage(
        data.gameServerId,
        {
          message: 'You cannot teleport yet. Please wait before trying again.',
        }
      );
      return;
    }
  }

  const teleport = JSON.parse(tpPoint.data.data[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(
    data.gameServerId,
    player.id,
    {
      x: teleport.x,
      y: teleport.y,
      z: teleport.z,
    }
  );

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `Teleported to ${teleport.name}.`,
  });
}

teleport();
