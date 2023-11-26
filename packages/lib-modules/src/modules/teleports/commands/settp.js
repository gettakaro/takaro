import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

function getVariableKey(tpName) {
  return `tp_${tpName}`;
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod, arguments: args } = data;

  const hasPermission = checkPermission(player, 'TELEPORTS_USE');

  if (!hasPermission) {
    throw new TakaroUserError('You do not have permission to use teleports.');
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
    throw new TakaroUserError(`Teleport ${args.tp} already exists, use ${prefix}deletetp ${args.tp} to delete it.`);
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

  if (allPlayerTeleports.data.data.length >= hasPermission.count) {
    throw new TakaroUserError(
      `You have reached the maximum number of teleports for your role, maximum allowed is ${hasPermission.count}`
    );
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
