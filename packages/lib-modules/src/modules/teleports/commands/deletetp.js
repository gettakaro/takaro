import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getVariableKey } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  const existingVariable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getVariableKey(args.tp), getVariableKey(args.tp, true)],
      gameServerId: [gameServerId],
      playerId: [pog.playerId],
      moduleId: [mod.moduleId],
    },
  });

  if (existingVariable.data.data.length === 0) {
    throw new TakaroUserError(`Teleport ${args.tp} does not exist.`);
  }

  await takaro.variable.variableControllerDelete(existingVariable.data.data[0].id);

  await data.player.pm(`Teleport ${args.tp} deleted.`);
}

await main();
