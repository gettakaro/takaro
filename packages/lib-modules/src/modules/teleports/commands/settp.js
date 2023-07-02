import { getTakaro, getData } from '@takaro/helpers';

function getVariableKey(tpName) {
  return `t_tp_${tpName}`;
}

async function settp() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod, arguments: args } = data;

  const prefix = (
    await takaro.settings.settingsControllerGetOne(
      'commandPrefix',
      gameServerId
    )
  ).data.data;

  const existingVariable = await takaro.variable.variableControllerFind({
    filters: {
      key: getVariableKey(args.tp),
      gameServerId,
      playerId: player.id,
    },
  });

  if (existingVariable.data.data.length > 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `Teleport ${args.tp} already exists, use ${prefix}deletetp ${args.tp} to delete it.`,
    });
    return;
  }

  const allPlayerTeleports = await takaro.variable.variableControllerFind({
    search: {
      key: getVariableKey(''),
    },
    filters: {
      gameServerId,
      playerId: player.id,
    },
  });

  if (allPlayerTeleports.data.data.length >= mod.userConfig.maxTeleports) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `You have reached the maximum number of teleports, maximum allowed is ${mod.userConfig.maxTeleports}`,
    });
    return;
  }

  await takaro.variable.variableControllerCreate({
    key: getVariableKey(args.tp),
    value: JSON.stringify({
      name: args.tp,
      x: data.player.location.x,
      y: data.player.location.y,
      z: data.player.location.z,
    }),
    gameServerId,
    playerId: player.id,
  });

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Teleport ${args.tp} set.`,
  });
}

settp();
