import { TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo, PaginatedOutput } from './base.js';
import {
  DEFAULT_SETTINGS,
  Settings,
  SETTINGS_KEYS,
  SettingsMode,
  SettingsOutputDTO,
  SETTINGS_DEFINITIONS,
} from '../service/SettingsService.js';

export const SETTINGS_TABLE_NAME = 'settings';

export class SettingsModel extends TakaroModel {
  static tableName = SETTINGS_TABLE_NAME;

  key!: string;
  value!: string;
  gameServerId: string | null = null;
}
@traceableClass('repo:settings')
export class SettingsRepo extends ITakaroRepo<SettingsModel, Settings, never, never> {
  constructor(
    public readonly domainId: string,
    public readonly gameServerId: string | null = null,
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

  async get(key: SETTINGS_KEYS): Promise<SettingsOutputDTO> {
    const { query } = await this.getModel();
    const { query: query2 } = await this.getModel();

    const domainSetting = await query.where({ key, gameServerId: null }).first();
    const gameServerSetting = await query2.where({ key }).andWhere({ gameServerId: this.gameServerId }).first();

    const settingDefinition = SETTINGS_DEFINITIONS[key];

    if (!domainSetting && !gameServerSetting) {
      return new SettingsOutputDTO({
        key,
        value: DEFAULT_SETTINGS[key],
        type: SettingsMode.Default,
        description: settingDefinition.description,
        canHaveGameServerOverride: settingDefinition.canHaveGameServerOverride,
      });
    }

    if (this.gameServerId) {
      if (gameServerSetting?.value) {
        return new SettingsOutputDTO({
          key,
          value: gameServerSetting?.value,
          type: SettingsMode.Override,
          description: settingDefinition.description,
          canHaveGameServerOverride: settingDefinition.canHaveGameServerOverride,
        });
      } else {
        return new SettingsOutputDTO({
          key,
          value: domainSetting?.value,
          type: SettingsMode.Inherit,
          description: settingDefinition.description,
          canHaveGameServerOverride: settingDefinition.canHaveGameServerOverride,
        });
      }
    } else {
      return new SettingsOutputDTO({
        key,
        value: domainSetting?.value,
        type: SettingsMode.Global,
        description: settingDefinition.description,
        canHaveGameServerOverride: settingDefinition.canHaveGameServerOverride,
      });
    }
  }

  async getAll(): Promise<SettingsOutputDTO[]> {
    const toReturn: Array<Promise<SettingsOutputDTO>> = [];

    for (const key of Object.values(SETTINGS_KEYS)) {
      toReturn.push(this.get(key));
    }

    return Promise.all(toReturn);
  }

  async set(key: SETTINGS_KEYS, value: string | null): Promise<SettingsOutputDTO[]> {
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
