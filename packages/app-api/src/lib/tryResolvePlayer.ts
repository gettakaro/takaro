import { ctx, errors, logger } from '@takaro/util';
import {
  PlayerOnGameServerService,
  PlayerOnGameserverOutputWithRolesDTO,
} from '../service/PlayerOnGameserverService.js';
import { PlayerService } from '../service/Player/index.js';

const log = logger('lib:tryResolvePlayer');

/**
 * Try and resolve a player from the given input.
 * Supports (partial) names, IDs, ...
 * @param input Some user-provided input
 */
export async function tryResolvePlayer(
  input: string,
  gameServerId: string,
): Promise<PlayerOnGameserverOutputWithRolesDTO> {
  const domainId = ctx.data.domain;

  if (!domainId) {
    log.error('Missing domainId');
    throw new errors.InternalServerError();
  }

  const playerService = new PlayerService(domainId);

  const possiblePlayers = await playerService.find({
    search: {
      name: [input],
      steamId: [input],
      epicOnlineServicesId: [input],
      xboxLiveId: [input],
    },
    extend: ['playerOnGameServers'],
  });

  const filteredByGameServer = possiblePlayers.results
    .map((p) => p.playerOnGameServers)
    .filter((pogs) => {
      if (!pogs || !pogs.length) return false;
      return pogs.filter((playerOnGameServer) => playerOnGameServer.gameServerId === gameServerId);
    })
    .flat();

  if (filteredByGameServer.length === 0) {
    throw new errors.NotFoundError(`No player found with the name or ID "${input}"`);
  }

  if (filteredByGameServer.length > 1) {
    throw new errors.BadRequestError(`Multiple players found with the name or ID "${input}"`);
  }

  if (!filteredByGameServer[0]) {
    throw new errors.NotFoundError(`No player found with the name or ID "${input}"`);
  }

  const playerOnGameServerService = new PlayerOnGameServerService(domainId);

  return playerOnGameServerService.findOne(filteredByGameServer[0].id);
}
