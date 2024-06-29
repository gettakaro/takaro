import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { GameServerModel } from './gameserver.js';
import { ItemsModel } from './items.js';
import { FunctionModel } from './function.js';
import { RoleModel } from './role.js';
import { ITakaroRepo } from './base.js';
import { ShopListingOutputDTO, ShopListingUpdateDTO, ShopListingCreateDTO } from '../service/Shop/dto.js';

export const SHOP_LISTING_TABLE_NAME = 'shopListing';
export const SHOP_LISTING_ROLE_TABLE_NAME = 'shopListingRole';

export class ShopListingModel extends TakaroModel {
  static tableName = SHOP_LISTING_TABLE_NAME;

  id!: string;
  gameServerId!: string;
  itemId?: string;
  functionId?: string;
  price!: number;
  name?: string;

  static get relationMappings() {
    return {
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.gameServerId`,
          to: 'gameservers.id',
        },
      },
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemsModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.itemId`,
          to: 'items.id',
        },
      },
      function: {
        relation: Model.BelongsToOneRelation,
        modelClass: FunctionModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.functionId`,
          to: 'functions.id',
        },
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: RoleModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.id`,
          through: {
            from: `${SHOP_LISTING_ROLE_TABLE_NAME}.listingId`,
            to: `${SHOP_LISTING_ROLE_TABLE_NAME}.roleId`,
          },
          to: 'roles.id',
        },
      },
    };
  }
}

export class ShopListingRoleModel extends TakaroModel {
  static tableName = SHOP_LISTING_ROLE_TABLE_NAME;

  id!: string;
  listingId!: string;
  roleId!: string;

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_LISTING_ROLE_TABLE_NAME}.listingId`,
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: `${SHOP_LISTING_ROLE_TABLE_NAME}.roleId`,
          to: 'roles.id',
        },
      },
    };
  }
}

@traceableClass('repo:shopListing')
export class ShopListingRepo extends ITakaroRepo<
  ShopListingModel,
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ShopListingModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async getListingRoleModel() {
    const knex = await this.getKnex();
    const model = ShopListingRoleModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async create(item: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const { query } = await this.getModel();
    const listing = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new ShopListingOutputDTO(listing);
  }

  async find(filters: ITakaroQuery<ShopListingOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<ShopListingModel, ShopListingOutputDTO>({
      ...filters,
    }).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ShopListingOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<ShopListingOutputDTO> {
    const { query } = await this.getModel();
    const res = await query.findById(id).withGraphFetched('item');
    if (!res) {
      throw new errors.NotFoundError();
    }
    return new ShopListingOutputDTO(res);
  }

  async update(id: string, data: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new ShopListingOutputDTO(res);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async addRole(listingId: string, roleId: string): Promise<ShopListingOutputDTO> {
    const { query } = await this.getListingRoleModel();
    await query.insert({
      listingId,
      roleId,
      domain: this.domainId,
    });
    const listing = await this.findOne(listingId);
    return listing;
  }

  async removeRole(listingId: string, roleId: string): Promise<boolean> {
    const { query } = await this.getListingRoleModel();
    const existing = await query.findOne({ listingId, roleId });
    if (!existing) throw new errors.NotFoundError();

    const data = await query.deleteById(existing.id);
    return !!data;
  }
}
