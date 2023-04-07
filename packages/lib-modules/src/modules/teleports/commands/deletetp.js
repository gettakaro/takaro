import { getTakaro, getData } from '@takaro/helpers';

function getVariableKey(gameServerId, playerId, tpName) {
  return `t_tp_${gameServerId}_${playerId}_${tpName}`;
}

async function deletetp() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const existingVariable = await takaro.variable.variableControllerFind({
    filters: {
      key: getVariableKey(data.gameServerId, player.gameId, data.arguments.tp),
    },
  });

  if (existingVariable.data.data.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `Teleport ${data.arguments.tp} does not exist.`,
    });
    return;
  }

  await takaro.variable.variableControllerDelete(
    existingVariable.data.data[0].id
  );

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `Teleport ${data.arguments.tp} deleted.`,
  });
}

deletetp();
