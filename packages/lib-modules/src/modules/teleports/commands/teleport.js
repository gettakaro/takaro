import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { findTp } from './utils.js';

async function main() {
  const { pog, gameServerId, arguments: args, module: mod } = data;

  const ownedTeleportRes = await findTp(args.tp, pog.playerId);

  let teleports = ownedTeleportRes.data.data;

  if (mod.userConfig.allowPublicTeleports) {
    const publicTeleportRes = await findTp(args.tp, null, true);
    teleports = teleports.concat(publicTeleportRes.data.data);
  }

  if (teleports.length === 0) {
    throw new TakaroUserError(`Teleport ${args.tp} does not exist.`);
  }

  const timeout = mod.userConfig.timeout;

  if (timeout > 0) {
    const lastExecuted = await takaro.variable.variableControllerSearch({
      filters: {
        key: ['lastExecuted'],
        gameServerId: [gameServerId],
        playerId: [pog.playerId],
        moduleId: [mod.moduleId],
      },
    });
    let lastExecutedRecord = lastExecuted.data.data[0];

    if (!lastExecutedRecord) {
      const createRes = await takaro.variable.variableControllerCreate({
        key: 'lastExecuted',
        gameServerId,
        playerId: pog.playerId,
        moduleId: mod.moduleId,
        value: new Date().toISOString(),
      });
      lastExecutedRecord = createRes.data.data;
    } else {
      const lastExecutedTime = new Date(lastExecutedRecord.value);
      const now = new Date();

      const diff = now.getTime() - lastExecutedTime.getTime();

      if (diff < timeout) {
        throw new TakaroUserError('You cannot teleport yet. Please wait before trying again.');
      }
    }

    const teleport = JSON.parse(teleports[0].value);

    await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, pog.playerId, {
      x: teleport.x,
      y: teleport.y,
      z: teleport.z,
      dimension: teleport.dimension,
    });

    await data.player.pm(`Teleported to ${teleport.name}.`);

    if (timeout !== 0 && lastExecutedRecord) {
      await takaro.variable.variableControllerUpdate(lastExecutedRecord.id, {
        value: new Date().toISOString(),
      });
    }
    return;
  }

  const teleport = JSON.parse(teleports[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, pog.playerId, {
    x: teleport.x,
    y: teleport.y,
    z: teleport.z,
    dimension: teleport.dimension,
  });

  await data.player.pm(`Teleported to ${teleport.name}.`);
}

await main();
