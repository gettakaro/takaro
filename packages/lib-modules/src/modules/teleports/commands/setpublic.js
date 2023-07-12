import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId, module: mod, arguments: args } = data;

  const prefix = (await takaro.settings.settingsControllerGetOne('commandPrefix', gameServerId)).data.data;

  if (!mod.userConfig.allowPublicTeleports) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: 'Public teleports are disabled.',
    });
    return;
  }

  const teleportRes = await takaro.variable.variableControllerFind({
    filters: {
      gameServerId,
      playerId: player.playerId,
      key: `t_tp_${args.tp}`,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `No teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`,
    });
  }

  const teleportRecord = teleports[0];
  const teleport = JSON.parse(teleportRecord.value);

  await takaro.variable.variableControllerUpdate(teleportRecord.id, {
    value: JSON.stringify({
      ...teleport,
      public: true,
    }),
  });

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `Teleport ${args.tp} is now public.`,
  });
}

await main();
