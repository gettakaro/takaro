import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { EntityCreateDTO, EntityOutputDTO, EntityUpdateDTO } from '../service/EntitiesService.js';
import { GAMESERVER_TABLE_NAME, GameServerModel } from './gameserver.js';

export const ENTITIES_TABLE_NAME = 'entities';

export class EntitiesModel extends TakaroModel {
  static tableName = ENTITIES_TABLE_NAME;

  name!: string;
  code!: string;
  description?: string;
  type?: 'hostile' | 'friendly' | 'neutral';
  metadata?: Record<string, unknown>;

  gameserverId!: string;

  static get relationMappings() {
    return {
      gameserver: {
        relation: TakaroModel.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${ENTITIES_TABLE_NAME}.gameserverId`,
          to: `${GAMESERVER_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:entity')
export class EntityRepo extends ITakaroRepo<EntitiesModel, EntityOutputDTO, EntityCreateDTO, EntityUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = EntitiesModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async translateEntityCodesToIds(gameserverId: string, codes: string[]): Promise<EntityOutputDTO[]> {
    const { query } = await this.getModel();
    const data = await query.whereIn('code', codes).andWhere('gameserverId', gameserverId);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return Promise.all(data.map((entity) => new EntityOutputDTO(entity)));
  }

  async find(filters: ITakaroQuery<EntityOutputDTO>) {
    const { query } = await this.getModel();

    if (!filters.sortBy) {
      // Add a sort by length of `code` so that short codes are up front
      // This provides much better search results for users. Eg the difference between `zombie` vs `zombieArleneJumper`
      query.orderByRaw('LENGTH("code") ASC');
    }

    const qry = new QueryBuilder<EntitiesModel, EntityOutputDTO>(filters).build(query);

    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((entity) => new EntityOutputDTO(entity))),
    };
  }

  async findOne(id: string): Promise<EntityOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new EntityOutputDTO(data);
  }

  async create(entity: EntityCreateDTO): Promise<EntityOutputDTO> {
    const { query } = await this.getModel();

    const data = await query
      .insert({
        ...entity.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new EntityOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: EntityUpdateDTO): Promise<EntityOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new EntityOutputDTO(res);
  }

  async upsertMany(entities: EntityCreateDTO[]): Promise<void> {
    const knex = await this.getKnex();

    // Ensure all unique
    entities = entities.filter((entity, index, self) => {
      return self.findIndex((t) => t.code === entity.code && t.gameserverId === entity.gameserverId) === index;
    });

    // Transform entities into a format suitable for bulk insert
    const dataToInsert = entities.map((entity) => {
      return {
        name: entity.name,
        code: entity.code,
        gameserverId: entity.gameserverId,
        description: entity.description || null,
        type: entity.type || null,
        metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
        domain: this.domainId,
      };
    });

    const chunks = [];

    // Split data into chunks of 1000 entities each
    for (let i = 0; i < dataToInsert.length; i += 1000) {
      chunks.push(dataToInsert.slice(i, i + 1000));
    }

    const promises = chunks.map(async (chunk) => {
      const values = chunk.flatMap((c) => [
        c.name,
        c.code,
        c.description,
        c.type,
        c.metadata,
        c.gameserverId,
        c.domain,
      ]);
      // Perform the bulk upsert operation
      try {
        await knex.raw(
          `
        INSERT INTO ${ENTITIES_TABLE_NAME} (name, code, description, type, metadata, "gameserverId", domain)
        VALUES ${chunk.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
        ON CONFLICT (code, "gameserverId", domain)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          type = EXCLUDED.type,
          metadata = EXCLUDED.metadata
      `,
          values,
        );
      } catch (error) {
        this.log.error(error);
      }
    });

    await Promise.all(promises);
  }

  async findEntitiesByCodes(codes: string[], gameServerId: string): Promise<EntityOutputDTO[]> {
    const { query } = await this.getModel();
    const data = await query.whereIn('code', codes).andWhere('gameserverId', gameServerId);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return Promise.all(data.map((entity) => new EntityOutputDTO(entity)));
  }
}
