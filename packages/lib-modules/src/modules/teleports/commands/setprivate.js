import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, arguments: args, module: mod } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  const teleportRes = await takaro.variable.variableControllerSearch({
    filters: {
      gameServerId: [gameServerId],
      playerId: [player.playerId],
      key: [`tp_${args.tp}`],
      moduleId: [mod.moduleId],
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    await data.player.pm(`No teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`);
  }

  const teleportRecord = teleports[0];
  const teleport = JSON.parse(teleportRecord.value);

  await takaro.variable.variableControllerUpdate(teleportRecord.id, {
    value: JSON.stringify({
      ...teleport,
      public: false,
    }),
  });

  await data.player.pm(`Teleport ${args.tp} is now private.`);
}

await main();
