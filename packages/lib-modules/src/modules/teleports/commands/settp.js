import { getTakaro, getData } from '@takaro/helpers';

function getVariableKey(tpName) {
  return `t_tp_${tpName}`;
}

async function settp() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const existingVariable = await takaro.variable.variableControllerFind({
    filters: {
      key: getVariableKey(data.arguments.tp),
      gameServerId: data.gameServerId,
      playerId: player.id,
    },
  });

  if (existingVariable.data.data.length > 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `Teleport ${data.arguments.tp} already exists, use /deletetp ${data.arguments.tp} to delete it.`,
    });
    return;
  }

  const allPlayerTeleports = await takaro.variable.variableControllerFind({
    search: {
      key: getVariableKey(''),
    },
    filters: {
      gameServerId: data.gameServerId,
      playerId: player.id,
    },
  });

  if (
    allPlayerTeleports.data.data.length >= data.module.userConfig.maxTeleports
  ) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `You have reached the maximum number of teleports, maximum allowed is ${data.module.userConfig.maxTeleports}`,
    });
    return;
  }

  await takaro.variable.variableControllerCreate({
    key: getVariableKey(data.arguments.tp),
    value: JSON.stringify({
      name: data.arguments.tp,
      x: data.player.location.x,
      y: data.player.location.y,
      z: data.player.location.z,
    }),
    gameServerId: data.gameServerId,
    playerId: player.id,
  });

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `Teleport ${data.arguments.tp} set.`,
  });
}

settp();
