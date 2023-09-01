import { getTakaro, getData, checkPermission } from '@takaro/helpers';

function getVariableKey(tpName) {
  return `tp_${tpName}`;
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod, arguments: args } = data;

  if (!checkPermission(player, 'TELEPORTS_USE')) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: 'You do not have permission to use teleports.',
      opts: {
        recipient: {
          gameId: player.gameId,
        },
      },
    });
    return;
  }

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  const existingVariable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getVariableKey(args.tp)],
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
    },
  });

  if (existingVariable.data.data.length > 0) {
    await data.player.pm(`Teleport ${args.tp} already exists, use ${prefix}deletetp ${args.tp} to delete it.`);
    return;
  }

  const allPlayerTeleports = await takaro.variable.variableControllerSearch({
    search: {
      key: getVariableKey(''),
    },
    filters: {
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
    },
  });

  if (allPlayerTeleports.data.data.length >= mod.userConfig.maxTeleports) {
    await data.player.pm(
      `You have reached the maximum number of teleports, maximum allowed is ${mod.userConfig.maxTeleports}`
    );
    return;
  }

  await takaro.variable.variableControllerCreate({
    key: getVariableKey(args.tp),
    value: JSON.stringify({
      name: args.tp,
      x: data.player.positionX,
      y: data.player.positionY,
      z: data.player.positionZ,
    }),
    gameServerId,
    moduleId: mod.moduleId,
    playerId: player.playerId,
  });

  await data.player.pm(`Teleport ${args.tp} set.`);
}

await main();
