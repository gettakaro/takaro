import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getVariableKey, findTp } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod, arguments: args } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data.value;

  const existingVariable = await findTp(args.tp, pog.playerId);

  if (existingVariable.data.data.length > 0) {
    throw new TakaroUserError(`Teleport ${args.tp} already exists, use ${prefix}deletetp ${args.tp} to delete it.`);
  }

  await takaro.variable.variableControllerCreate({
    key: getVariableKey(args.tp),
    value: JSON.stringify({
      name: args.tp,
      x: data.pog.positionX,
      y: data.pog.positionY,
      z: data.pog.positionZ,
      dimension: data.pog.dimension,
    }),
    gameServerId,
    moduleId: mod.moduleId,
    playerId: pog.playerId,
  });

  await data.player.pm(`Teleport ${args.tp} set.`);
}

await main();
