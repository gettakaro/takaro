import { TakaroModel } from '@takaro/db';
import { Page } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { Settings, SETTINGS_KEYS } from '../service/SettingsService';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  domainId!: string;

  commandPrefix!: string;
  serverChatName!: string;
}

export class SettingsRepo extends ITakaroRepo<SettingsModel> {
  async getModel() {
    const knex = await this.getKnex();
    return SettingsModel.bindKnex(knex);
  }
  async find(): Promise<Page<SettingsModel>> {
    // Use the "getAll" method instead
    throw new errors.NotImplementedError();
  }

  async findOne(): Promise<SettingsModel> {
    // Use the "get" method instead
    throw new errors.NotImplementedError();
  }

  async create(): Promise<SettingsModel> {
    const model = await this.getModel();
    return model.query().insert({ domainId: this.domainId }).returning('*');
  }

  async delete(): Promise<boolean> {
    // This will cascade when a domain or gameserver is deleted
    throw new errors.NotImplementedError();
  }

  async update(): Promise<SettingsModel> {
    // Use the "set" method instead
    throw new errors.NotImplementedError();
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    const model = await this.getModel();
    const data = await model.query().where({ domainId: this.domainId });

    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return data[0][key];
  }

  async getAll(): Promise<Settings> {
    const model = await this.getModel();
    const data = await model.query().where({ domainId: this.domainId });

    if (!data.length) {
      throw new errors.NotFoundError();
    }

    return {
      commandPrefix: data[0].commandPrefix,
      serverChatName: data[0].serverChatName,
    };
  }

  async set(key: SETTINGS_KEYS, value: string): Promise<void> {
    const model = await this.getModel();
    await model
      .query()
      .update({ [key]: value })
      .where({ domainId: this.domainId });
  }
}
