import { TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo, PaginatedOutput } from './base.js';
import { DEFAULT_SETTINGS, Settings, SETTINGS_KEYS } from '../service/SettingsService.js';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  key!: string;
  value!: string;
  gameServerId?: string;
}
@traceableClass('repo:settings')
export class SettingsRepo extends ITakaroRepo<SettingsModel, Settings, never, never> {
  constructor(public readonly domainId: string, public readonly gameServerId?: string) {
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

    if (this.gameServerId) {
      data = await query.where({ gameServerId: this.gameServerId, key }).first();
    } else {
      data = await query.where({ key, gameServerId: null }).first();
    }

    if (!data) {
      return DEFAULT_SETTINGS[key] as string;
    }

    return data.value;
  }

  async getAll(): Promise<Settings> {
    let data: SettingsModel[];
    const { query } = await this.getModel();

    if (this.gameServerId) {
      data = await query.where({ gameServerId: this.gameServerId });
    } else {
      data = await query.where({ gameServerId: null });
    }

    const toReturn = await new Settings().construct();

    for (const key of Object.values(SETTINGS_KEYS)) {
      toReturn[key] = data.find((x) => x.key === key)?.value || DEFAULT_SETTINGS[key];
    }

    return toReturn;
  }

  async set(key: SETTINGS_KEYS, value: string): Promise<Settings> {
    const { query } = await this.getModel();

    await query
      .insert({ domain: this.domainId, gameServerId: this.gameServerId, key, value })
      .onConflict(['domain', 'key', 'gameServerId'])
      .merge({ value });

    return this.getAll();
  }
}
