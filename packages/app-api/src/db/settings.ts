import { TakaroModel } from '@takaro/db';
import { errors } from '@takaro/util';
import { ITakaroRepo, PaginatedOutput } from './base.js';
import {
  DEFAULT_SETTINGS,
  Settings,
  SETTINGS_KEYS,
} from '../service/SettingsService.js';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  commandPrefix!: string;
  serverChatName!: string;
}

export class GameServerSettingsModel extends SettingsModel {
  static tableName = 'gameServerSettings';
  gameServerId!: string;
}

export class SettingsRepo extends ITakaroRepo<
  SettingsModel,
  Settings,
  never,
  never
> {
  constructor(
    public readonly domainId: string,
    public readonly gameServerId?: string
  ) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = SettingsModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async getGameServerModel() {
    const knex = await this.getKnex();
    const model = GameServerSettingsModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(): Promise<PaginatedOutput<never>> {
    // Use the "getAll" method instead
    throw new errors.NotImplementedError();
  }

  async findOne(): Promise<never> {
    // Use the "get" method instead
    throw new errors.NotImplementedError();
  }

  async delete(): Promise<boolean> {
    // This will cascade when a domain or gameserver is deleted
    throw new errors.NotImplementedError();
  }

  async update(): Promise<never> {
    // Use the "set" method instead
    throw new errors.NotImplementedError();
  }

  async create(): Promise<Settings> {
    const defaults = await DEFAULT_SETTINGS;
    if (this.gameServerId) {
      const { query } = await this.getGameServerModel();
      const data = await query
        .insert({
          gameServerId: this.gameServerId,
          domain: this.domainId,
          ...defaults.toJSON(),
        })
        .returning('*');
      return new Settings().construct(data);
    }

    const { query } = await this.getModel();
    const res = await query
      .insert({
        domain: this.domainId,
        ...defaults.toJSON(),
      })
      .returning('*');
    return new Settings().construct(res);
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    let data: SettingsModel[] | GameServerSettingsModel[];

    if (this.gameServerId) {
      const { query } = await this.getGameServerModel();
      data = await query.where({ gameServerId: this.gameServerId });
    } else {
      const { query } = await this.getModel();
      data = await query.where({ domain: this.domainId });
    }

    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return data[0][key];
  }

  async getAll(): Promise<Settings> {
    let data: SettingsModel[] | GameServerSettingsModel[];

    if (this.gameServerId) {
      const { query } = await this.getGameServerModel();
      data = await query.where({ gameServerId: this.gameServerId });
    } else {
      const { query } = await this.getModel();
      data = await query.where({ domain: this.domainId });
    }
    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return new Settings().construct({
      commandPrefix: data[0].commandPrefix,
      serverChatName: data[0].serverChatName,
    });
  }

  async set(key: SETTINGS_KEYS, value: string): Promise<void> {
    if (this.gameServerId) {
      const { query } = await this.getGameServerModel();
      await query
        .where({ gameServerId: this.gameServerId })
        .update({ [key]: value });
      return;
    }

    const { query } = await this.getModel();
    await query.update({ [key]: value }).where({ domain: this.domainId });
  }
}
