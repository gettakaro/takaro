import { getTakaro, getData } from '@takaro/helpers';

function getVariableKey(gameServerId, playerId, tpName) {
  return `t_tp_${gameServerId}_${playerId}_${tpName}`;
}

async function settp() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const existingVariable = await takaro.variable.variableControllerFind({
    filters: {
      key: getVariableKey(data.gameServerId, player.gameId, data.arguments.tp),
    },
  });

  if (existingVariable.data.data.length > 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `Teleport ${data.arguments.tp} already exists, use /deletetp ${data.arguments.tp} to delete it.`,
    });
    return;
  }

  await takaro.variable.variableControllerCreate({
    key: getVariableKey(data.gameServerId, player.gameId, data.arguments.tp),
    value: JSON.stringify({
      name: data.arguments.tp,
      x: data.player.location.x,
      y: data.player.location.y,
      z: data.player.location.z,
    }),
  });

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `Teleport ${data.arguments.tp} set.`,
  });
}

settp();
