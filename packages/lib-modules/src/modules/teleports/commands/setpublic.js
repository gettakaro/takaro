import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { getVariableKey } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod, arguments: args } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data.value;

  if (!mod.userConfig.allowPublicTeleports) {
    throw new TakaroUserError('Public teleports are disabled.');
  }

  const teleports = (
    await takaro.variable.variableControllerSearch({
      filters: {
        gameServerId: [gameServerId],
        playerId: [pog.playerId],
        moduleId: [mod.moduleId],
        key: [getVariableKey(args.tp)],
      },
      sortBy: 'key',
      sortDirection: 'asc',
    })
  ).data.data;

  if (teleports.length === 0) {
    throw new TakaroUserError(`No teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`);
  }

  const teleportRecord = teleports[0];
  const teleport = JSON.parse(teleportRecord.value);

  await takaro.variable.variableControllerUpdate(teleportRecord.id, {
    key: getVariableKey(args.tp, true),
    value: JSON.stringify(teleport),
  });

  await data.player.pm(`Teleport ${args.tp} is now public.`);
}

await main();
