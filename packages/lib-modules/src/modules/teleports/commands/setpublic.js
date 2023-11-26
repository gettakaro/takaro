import { getTakaro, getData, checkPermission, TakaroUserError } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod, arguments: args } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  if (!mod.userConfig.allowPublicTeleports) {
    throw new TakaroUserError('Public teleports are disabled.');
  }

  const hasPermission = checkPermission(player, 'TELEPORTS_CREATE_PUBLIC');

  if (!hasPermission) {
    throw new TakaroUserError('You do not have permission to create public teleports.');
  }

  const existingTeleportsForPlayerRes = await takaro.variable.variableControllerSearch({
    search: {
      key: 'tp_',
    },
    filters: {
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
    },
  });

  const existingPublicTeleportsForPlayer = existingTeleportsForPlayerRes.data.data.filter((tp) => {
    const teleport = JSON.parse(tp.value);
    return teleport.public;
  });

  if (existingPublicTeleportsForPlayer.length >= hasPermission.count) {
    throw new TakaroUserError(
      `You have reached the maximum number of public teleports for your role, maximum allowed is ${hasPermission.count}`
    );
  }

  const teleportRes = await takaro.variable.variableControllerSearch({
    filters: {
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      moduleId: [mod.moduleId],
      key: [`tp_${args.tp}`],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    throw new TakaroUserError(`No teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`);
  }

  const teleportRecord = teleports[0];
  const teleport = JSON.parse(teleportRecord.value);

  await takaro.variable.variableControllerUpdate(teleportRecord.id, {
    value: JSON.stringify({
      ...teleport,
      public: true,
    }),
  });

  await data.player.pm(`Teleport ${args.tp} is now public.`);
}

await main();
