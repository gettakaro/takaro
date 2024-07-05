import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getVariableKey } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  const teleportRes = await takaro.variable.variableControllerSearch({
    filters: {
      gameServerId: [gameServerId],
      playerId: [pog.playerId],
      key: [getVariableKey(args.tp, true)],
      moduleId: [mod.moduleId],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    throw new TakaroUserError(
      `No public teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`
    );
  }

  const teleportRecord = teleports[0];
  const teleport = JSON.parse(teleportRecord.value);

  await takaro.variable.variableControllerUpdate(teleportRecord.id, {
    key: getVariableKey(args.tp),
    value: JSON.stringify(teleport),
  });

  await data.player.pm(`Teleport ${args.tp} is now private.`);
}

await main();
