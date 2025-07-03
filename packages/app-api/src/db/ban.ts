import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';

import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from '../service/Ban/dto.js';
import { GameServerModel } from './gameserver.js';
import { PlayerModel } from './player.js';

export const BANS_TABLE_NAME = 'bans';

export class BanModel extends TakaroModel {
  static tableName = BANS_TABLE_NAME;
  gameServerId: string;
  playerId: string;

  takaroManaged: boolean;
  isGlobal: boolean;
  until: string;
  reason: string;

  static get relationMappings() {
    return {
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${BANS_TABLE_NAME}.gameServerId`,
          to: `${GameServerModel.tableName}.id`,
        },
      },
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerModel,
        join: {
          from: `${BANS_TABLE_NAME}.playerId`,
          to: `${PlayerModel.tableName}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:ban')
export class BanRepo extends ITakaroRepo<BanModel, BanOutputDTO, BanCreateDTO, BanUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = BanModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<BanOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<BanModel, BanOutputDTO>({
      ...filters,
    }).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new BanOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<BanOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new BanOutputDTO(data);
  }

  async create(item: BanCreateDTO): Promise<BanOutputDTO> {
    const { query } = await this.getModel();
    const data = item.toJSON();
    if (!data.takaroManaged) data.takaroManaged = false;
    try {
      const record = await query.insert({ ...data, domain: this.domainId });
      return this.findOne(record.id);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'CheckViolationError' &&
          'constraint' in error &&
          error.constraint === 'bans_global_gameserver_check'
        ) {
          throw new errors.BadRequestError(
            'When creating a global ban, gameServerId must be null. When creating a non-global ban, gameServerId must be set.',
          );
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const res = await query.deleteById(id);
    return res > 0;
  }

  async update(id: string, _data: BanUpdateDTO): Promise<BanOutputDTO> {
    const { query } = await this.getModel();
    try {
      await query.patch(_data.toJSON());
      return this.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.name === 'CheckViolationError' &&
          'constraint' in error &&
          error.constraint === 'bans_global_gameserver_check'
        ) {
          throw new errors.BadRequestError(
            'When creating a global ban, gameServerId must be null. When creating a non-global ban, gameServerId must be set.',
          );
        }
      }
      throw error;
    }
  }

  async syncBans(gameServerId: string, bans: BanCreateDTO[]) {
    const { model } = await this.getModel();
    const knex = model.knex();

    // We try to do all this in as little queries as possible for better performance
    // Start a transaction to ensure all operations are atomic
    await knex.transaction(async (trx) => {
      if (bans.length > 0) {
        // Upsert all the bans
        await trx(BANS_TABLE_NAME)
          .insert(
            bans.map((ban) => ({
              gameServerId,
              playerId: ban.playerId,
              reason: ban.reason,
              until: ban.until,
              takaroManaged: false,
              domain: this.domainId,
            })),
          )
          .onConflict(['gameServerId', 'playerId'])
          .merge(['reason', 'until'])
          .where('bans.domain', this.domainId);

        // Delete all bans that are no longer in the game server & are not takaro managed
        await trx(BANS_TABLE_NAME)
          .where({
            gameServerId,
            domain: this.domainId,
            takaroManaged: false,
          })
          .whereNotIn(
            'playerId',
            bans.map((ban) => ban.playerId),
          )
          .delete();
      }

      // If there are no bans left, delete all bans for the game server
      if (bans.length === 0) {
        await trx(BANS_TABLE_NAME)
          .where({
            gameServerId,
            domain: this.domainId,
            takaroManaged: false,
          })
          .delete();
      }
    });
  }
}
