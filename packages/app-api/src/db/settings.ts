import { TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo, PaginatedOutput } from './base.js';
import { DEFAULT_SETTINGS, Settings, SETTINGS_KEYS } from '../service/SettingsService.js';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  key!: string;
  value!: string;
  gameServerId: string | null = null;
}
@traceableClass('repo:settings')
export class SettingsRepo extends ITakaroRepo<SettingsModel, Settings, never, never> {
  constructor(public readonly domainId: string, public readonly gameServerId: string | null = null) {
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
    // Use the "set" method instead
    throw new errors.NotImplementedError();
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    let data: SettingsModel | undefined;
    const { query } = await this.getModel();
    const { query: query2 } = await this.getModel();

    const domainSetting = await query.where({ key, gameServerId: null }).first();
    const gameServerSetting = await query2.where({ key, gameServerId: this.gameServerId }).first();

    if (this.gameServerId) {
      data = gameServerSetting?.value ? gameServerSetting : domainSetting;
    } else {
      data = domainSetting;
    }

    if (!data) {
      return DEFAULT_SETTINGS[key] as string;
    }

    return data.value;
  }

  async getAll(): Promise<Settings> {
    const { query } = await this.getModel();
    const { query: query2 } = await this.getModel();

    const domainSetting = await query.where({ gameServerId: null });
    const gameServerSetting = await query2.where({ gameServerId: this.gameServerId });

    const toReturn = await new Settings().construct();

    for (const key of Object.values(SETTINGS_KEYS)) {
      if (this.gameServerId) {
        toReturn[key] =
          gameServerSetting.find((x) => x.key === key)?.value ||
          domainSetting.find((x) => x.key === key)?.value ||
          DEFAULT_SETTINGS[key];
      } else {
        toReturn[key] = domainSetting.find((x) => x.key === key)?.value || DEFAULT_SETTINGS[key];
      }
    }

    return toReturn;
  }

  async set(key: SETTINGS_KEYS, value: string | null): Promise<Settings> {
    const { query } = await this.getModel();

    if (value === null) {
      await query.where({ domain: this.domainId, gameServerId: this.gameServerId, key }).del();
      return this.getAll();
    }

    await query
      .insert({ domain: this.domainId, gameServerId: this.gameServerId, key, value })
      .onConflict(['domain', 'key', 'gameServerId'])
      .merge(['value']);

    return this.getAll();
  }
}
