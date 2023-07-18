import { getTakaro, getData, checkPermission } from '@takaro/helpers';

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

  if (!checkPermission(player, 'TELEPORTS_CREATE_PUBLIC')) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: 'You do not have permission to create public teleports.',
      opts: {
        recipient: {
          gameId: player.gameId,
        },
      },
    });
    return;
  }

  const teleportRes = await takaro.variable.variableControllerFind({
    filters: {
      gameServerId,
      playerId: player.playerId,
      moduleId: mod.moduleId,
      key: `tp_${args.tp}`,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `No teleport with name ${args.tp} found, use ${prefix}settp <name> to set one first.`,
      opts: {
        recipient: {
          gameId: player.gameId,
        },
      },
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
    opts: {
      recipient: {
        gameId: player.gameId,
      },
    },
  });
}

await main();
