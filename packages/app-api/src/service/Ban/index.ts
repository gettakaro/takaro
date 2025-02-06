import { TakaroService } from '../Base.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from './dto.js';
import { BanModel, BanRepo } from '../../db/ban.js';
import { GameServerService } from '../GameServerService.js';
import { PlayerService } from '../Player/index.js';

@traceableClass('service:ban')
export class BanService extends TakaroService<BanModel, BanOutputDTO, BanCreateDTO, BanUpdateDTO> {
  get repo() {
    return new BanRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<BanOutputDTO>): Promise<PaginatedOutput<BanOutputDTO>> {
    const data = await this.repo.find(filters);
    return data;
  }

  async findOne(id: string): Promise<BanOutputDTO> {
    const data = await this.repo.findOne(id);
    if (!data) throw new errors.NotFoundError(`Ban with id ${id} not found`);
    return data;
  }

  async create(item: BanCreateDTO): Promise<BanOutputDTO> {
    try {
      const gameServerService = new GameServerService(this.domainId);
      const reason = item.reason || 'No reason provided';
      // If no reason provided, we assume permanent ban
      // Some game servers still need a date, so we default to 1000 years from now
      const until = item.until || '3021-01-01T00:00:00.000Z';

      if (item.gameServerId) {
        await gameServerService.banPlayer(item.gameServerId, item.playerId, reason, until);
      }

      if (item.isGlobal) {
        const allGameservers = await gameServerService.find({});
        await Promise.all(
          allGameservers.results.map(async (gs) => {
            return gameServerService.banPlayer(gs.id, item.playerId, reason, until);
          }),
        );
      }
    } catch (error) {
      this.log.warn('Failed to apply ban on live server for player', { error });
    }

    return this.repo.create(item);
  }

  async update(id: string, item: BanUpdateDTO): Promise<BanOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string): Promise<string> {
    try {
      const existing = await this.findOne(id);

      if (existing.takaroManaged) {
        const gameServerService = new GameServerService(this.domainId);

        await gameServerService.unbanPlayer(existing.gameServerId, existing.playerId);

        if (existing.isGlobal) {
          const allGameservers = await gameServerService.find({});
          await Promise.all(
            allGameservers.results.map(async (gs) => {
              return gameServerService.unbanPlayer(gs.id, existing.playerId);
            }),
          );
        }
      }
    } catch (error) {
      this.log.warn('Failed to unban player on live server', { error });
    }

    await this.repo.delete(id);
    return id;
  }

  async handleGlobalBan(ban: BanOutputDTO, playerId: string) {
    const playerService = new PlayerService(this.domainId);
    const gameServerService = new GameServerService(this.domainId);
    const { player, pogs } = await playerService.resolveFromId(playerId);

    await Promise.all(
      pogs.map(async (pog) => {
        return gameServerService.banPlayer(pog.gameServerId, player.id, ban.reason, ban.until);
      }),
    );
  }

  async syncBans(gameServerId: string) {
    const gameServerService = new GameServerService(this.domainId);
    const playerService = new PlayerService(this.domainId);

    // We need to apply any global bans
    const globalBans = await this.find({ filters: { isGlobal: [true] } });
    const promises = await Promise.allSettled(
      globalBans.results.map(async (ban) => {
        return this.handleGlobalBan(ban, ban.playerId);
      }),
    );

    const failedGlobalBans = promises.filter((b) => b.status === 'rejected');
    if (failedGlobalBans.length > 0) {
      this.log.warn('Failed to apply global bans', { failedGlobalBans });
    }

    const currentGameserverBans = await gameServerService.listBans(gameServerId);

    const banPromises = await Promise.allSettled(
      currentGameserverBans.map(async (ban) => {
        const { player } = await playerService.resolveRef(ban.player, gameServerId);
        if (!player) {
          this.log.warn('Failed to resolve player for ban', { p: ban.player });
          return null;
        }

        return new BanCreateDTO({
          ...ban,
          gameServerId,
          playerId: player.id,
        });
      }),
    );

    const failedPromises = banPromises.filter((b) => b.status === 'rejected');
    if (failedPromises.length > 0) {
      this.log.warn(`Failed to resolve ${failedPromises.length} bans`, { failedPromises });
    }

    const banInputs = banPromises.map((b) => (b.status === 'fulfilled' ? b.value : null)).filter((b) => b !== null);
    await this.repo.syncBans(gameServerId, banInputs);
  }
}
