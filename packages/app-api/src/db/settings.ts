import { TakaroModel } from '@takaro/db';
import { errors } from '@takaro/logger';
import { ITakaroRepo, PaginatedOutput } from './base';
import {
  DEFAULT_SETTINGS,
  Settings,
  SETTINGS_KEYS,
} from '../service/SettingsService';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  domainId!: string;

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
    return SettingsModel.bindKnex(knex);
  }

  async getGameServerModel() {
    const knex = await this.getKnex();
    return GameServerSettingsModel.bindKnex(knex);
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
    if (this.gameServerId) {
      const model = await this.getGameServerModel();
      const data = await model
        .query()
        .insert({
          gameServerId: this.gameServerId,
          ...DEFAULT_SETTINGS.toJSON(),
        })
        .returning('*');
      return new Settings(data);
    }

    const model = await this.getModel();
    const res = await model
      .query()
      .insert({
        domainId: this.domainId,
        ...DEFAULT_SETTINGS.toJSON(),
      })
      .returning('*');
    return new Settings(res);
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    let data: SettingsModel[] | GameServerSettingsModel[];

    if (this.gameServerId) {
      const model = await this.getGameServerModel();
      data = await model.query().where({ gameServerId: this.gameServerId });
    } else {
      const model = await this.getModel();
      data = await model.query().where({ domainId: this.domainId });
    }

    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return data[0][key];
  }

  async getAll(): Promise<Settings> {
    let data: SettingsModel[] | GameServerSettingsModel[];

    if (this.gameServerId) {
      const model = await this.getGameServerModel();
      data = await model.query().where({ gameServerId: this.gameServerId });
    } else {
      const model = await this.getModel();
      data = await model.query().where({ domainId: this.domainId });
    }
    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return new Settings({
      commandPrefix: data[0].commandPrefix,
      serverChatName: data[0].serverChatName,
    });
  }

  async set(key: SETTINGS_KEYS, value: string): Promise<void> {
    if (this.gameServerId) {
      const model = await this.getGameServerModel();
      await model
        .query()
        .where({ gameServerId: this.gameServerId })
        .update({ [key]: value });
      return;
    }

    const model = await this.getModel();
    await model
      .query()
      .update({ [key]: value })
      .where({ domainId: this.domainId });
  }
}
