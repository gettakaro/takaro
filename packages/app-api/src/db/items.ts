import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { ItemCreateDTO, ItemsOutputDTO, ItemUpdateDTO } from '../service/ItemsService.js';
import { GAMESERVER_TABLE_NAME, GameServerModel } from './gameserver.js';

export const ITEMS_TABLE_NAME = 'items';

export class ItemsModel extends TakaroModel {
  static tableName = ITEMS_TABLE_NAME;

  name!: string;
  code!: string;
  description?: string;
  icon?: string;

  gameserverId!: string;

  static get relationMappings() {
    return {
      gameserver: {
        relation: TakaroModel.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${ITEMS_TABLE_NAME}.gameserverId`,
          to: `${GAMESERVER_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:item')
export class ItemRepo extends ITakaroRepo<ItemsModel, ItemsOutputDTO, ItemCreateDTO, ItemUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ItemsModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }
  async find(filters: ITakaroQuery<ItemsOutputDTO>) {
    const { query } = await this.getModel();

    if (!filters.sortBy) {
      // Add a sort by length of `code` so that short codes are up front
      // This provides much better search results for users. Eg the difference between `resourceWood` vs `awningWoodShapes:woodDebris07`
      query.orderByRaw('LENGTH("code") ASC');
    }

    const qry = new QueryBuilder<ItemsModel, ItemsOutputDTO>(filters).build(query);

    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ItemsOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<ItemsOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new ItemsOutputDTO(data);
  }

  async create(item: ItemCreateDTO): Promise<ItemsOutputDTO> {
    const { query } = await this.getModel();

    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new ItemsOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: ItemUpdateDTO): Promise<ItemsOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new ItemsOutputDTO(res);
  }

  async upsertMany(items: ItemCreateDTO[]): Promise<void> {
    const knex = await this.getKnex();

    // Ensure all unique
    items = items.filter((item, index, self) => {
      return self.findIndex((t) => t.code === item.code && t.gameserverId === item.gameserverId) === index;
    });

    // Transform items into a format suitable for bulk insert
    const dataToInsert = items.map((item) => {
      return {
        name: item.name,
        code: item.code,
        gameserverId: item.gameserverId,
        description: item.description || null,
        icon: item.icon || null,
        domain: this.domainId,
      };
    });

    const chunks = [];

    // Split data into chunks of 1000 items each
    for (let i = 0; i < dataToInsert.length; i += 1000) {
      chunks.push(dataToInsert.slice(i, i + 1000));
    }

    const promises = chunks.map(async (chunk) => {
      const values = chunk.flatMap((c) => [c.name, c.code, c.description, c.icon, c.gameserverId, c.domain]);
      // Perform the bulk upsert operation
      try {
        await knex.raw(
          `
        INSERT INTO ${ITEMS_TABLE_NAME} (name, code, description, icon, "gameserverId", domain)
        VALUES ${chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
        ON CONFLICT (code, "gameserverId", domain)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon
      `,
          values,
        );
      } catch (error) {
        this.log.error(error);
      }
    });

    await Promise.all(promises);
  }

  async findItemsByCodes(codes: string[], gameServerId: string): Promise<ItemsOutputDTO[]> {
    const { query } = await this.getModel();
    const data = await query.whereIn('code', codes).andWhere('gameserverId', gameServerId);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return Promise.all(data.map((item) => new ItemsOutputDTO(item)));
  }
}
