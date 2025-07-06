import { TakaroService } from '../Base.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from './dto.js';
import { BanModel, BanRepo } from '../../db/ban.js';
import { GameServerService } from '../GameServerService.js';
import { PlayerService } from '../Player/index.js';
import { EventService, EventCreateDTO } from '../EventService.js';
import { TakaroEvents, TakaroEventPlayerBanned, TakaroEventPlayerUnbanned } from '@takaro/modules';

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

    const created = await this.repo.create(item);

    try {
      const eventService = new EventService(this.domainId);
      await eventService.create(
        new EventCreateDTO({
          eventName: TakaroEvents.PLAYER_BANNED,
          playerId: created.playerId,
          gameserverId: created.gameServerId,
          meta: new TakaroEventPlayerBanned({
            reason: created.reason,
            until: created.until.toString(),
            isGlobal: created.isGlobal,
            takaroManaged: created.takaroManaged,
          }),
        }),
      );
    } catch (error) {
      this.log.warn('Failed to emit ban created event', { error });
    }

    return created;
  }

  async update(id: string, item: BanUpdateDTO): Promise<BanOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string): Promise<string> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError(`Ban with id ${id} not found`);
    try {
      if (existing.takaroManaged) {
        const gameServerService = new GameServerService(this.domainId);

        if (existing.isGlobal) {
          const allGameservers = await gameServerService.find({});
          const serverScopedBans = (await this.find({ filters: { playerId: [existing.playerId] } })).results.filter(
            (b) => !b.isGlobal,
          );

          const unbanPromises = allGameservers.results.map(async (gs) => {
            return gameServerService.unbanPlayer(gs.id, existing.playerId);
          });

          const childBanDeletePromises = serverScopedBans.map(async (b) => this.delete(b.id));
          this.log.debug(
            `Removing a global ban, deleting ${childBanDeletePromises.length} server-scoped bans and executing ${unbanPromises.length} unbans`,
          );
          await Promise.all([...unbanPromises, ...childBanDeletePromises]);
        } else {
          await gameServerService.unbanPlayer(existing.gameServerId, existing.playerId);
        }
      }
    } catch (error) {
      this.log.warn('Failed to unban player on live server', { error });
    }

    await this.repo.delete(id);

    try {
      const eventService = new EventService(this.domainId);
      await eventService.create(
        new EventCreateDTO({
          eventName: TakaroEvents.PLAYER_UNBANNED,
          playerId: existing.playerId,
          gameserverId: existing.gameServerId,
          meta: new TakaroEventPlayerUnbanned({
            isGlobal: existing.isGlobal,
            takaroManaged: existing.takaroManaged,
          }),
        }),
      );
    } catch (error) {
      this.log.warn('Failed to emit ban deleted event', { error });
    }

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

        // If this player has a global ban in Takaro, we create this ban as 'takaroManaged'
        const takaroManaged = globalBans.results.some((b) => b.playerId === player.id);

        return new BanCreateDTO({
          ...ban,
          gameServerId,
          playerId: player.id,
          takaroManaged,
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
