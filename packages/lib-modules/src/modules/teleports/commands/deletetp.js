import { getTakaro, getData } from '@takaro/helpers';

function getVariableKey(tpName) {
  return `t_tp_${tpName}`;
}

async function deletetp() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, arguments: args } = data;

  const existingVariable = await takaro.variable.variableControllerFind({
    filters: {
      key: getVariableKey(args.tp),
      gameServerId,
      playerId: player.playerId,
    },
  });

  if (existingVariable.data.data.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `Teleport ${args.tp} does not exist.`,
    });
    return;
  }

  await takaro.variable.variableControllerDelete(existingVariable.data.data[0].id);

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Teleport ${args.tp} deleted.`,
  });
}

deletetp();
