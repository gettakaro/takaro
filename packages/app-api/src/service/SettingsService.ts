import { TakaroDTO, TakaroModelDTO, ctx, traceableClass } from '@takaro/util';
import { IsEnum, IsString } from 'class-validator';
import { errors } from '@takaro/util';
import { PaginatedOutput } from '../db/base.js';
import { SettingsModel, SettingsRepo } from '../db/settings.js';
import { TakaroService } from './Base.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { TakaroEventSettingsSet } from '@takaro/modules';

export enum SETTINGS_KEYS {
  commandPrefix = 'commandPrefix',
  serverChatName = 'serverChatName',
  economyEnabled = 'economyEnabled',
  currencyName = 'currencyName',
}

export const DEFAULT_SETTINGS: Record<SETTINGS_KEYS, string> = {
  commandPrefix: '/',
  serverChatName: 'Takaro',
  economyEnabled: 'false',
  currencyName: 'Takaro coins',
};
export class Settings extends TakaroModelDTO<Settings> {
  @IsString()
  commandPrefix: string;

  @IsString()
  serverChatName: string;

  @IsString()
  economyEnabled: string;

  @IsString()
  currencyName: string;
}

export enum SettingsMode {
  Override = 'override',
  Inherit = 'inherit',
  Global = 'global',
  Default = 'default',
}

export class SettingsOutputDTO extends TakaroDTO<SettingsOutputDTO> {
  @IsEnum(SETTINGS_KEYS)
  key: SETTINGS_KEYS;

  @IsString()
  value: Settings[SETTINGS_KEYS];

  @IsEnum(SettingsMode)
  type: SettingsMode;
}

@traceableClass('service:settings')
export class SettingsService extends TakaroService<SettingsModel, Settings, never, never> {
  constructor(
    public readonly domainId: string,
    public readonly gameServerId?: string,
  ) {
    super(domainId);
  }

  get repo() {
    return new SettingsRepo(this.domainId, this.gameServerId);
  }

  async find(): Promise<PaginatedOutput<never>> {
    // Use the "getAll" method instead
    throw new errors.NotImplementedError();
  }

  async findOne(): Promise<never> {
    // Use the "get" method instead
    throw new errors.NotImplementedError();
  }

  create(): Promise<never> {
    // Use the "init" (created DB record) or "set" (changing a settings value) method instead
    throw new errors.NotImplementedError();
  }

  async delete(): Promise<string> {
    // This will cascade when a domain or gameserver is deleted
    throw new errors.NotImplementedError();
  }

  async update(): Promise<never> {
    // Use the "set" method instead
    throw new errors.NotImplementedError();
  }

  async get(key: SETTINGS_KEYS): Promise<SettingsOutputDTO> {
    const value = await this.repo.get(key);
    return value;
  }

  async set(key: SETTINGS_KEYS, value: Settings[SETTINGS_KEYS] | null): Promise<SettingsOutputDTO> {
    await this.repo.set(key, value);

    const eventsService = new EventService(this.domainId);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SETTINGS_SET,
        gameserverId: this.gameServerId,
        userId,
        meta: new TakaroEventSettingsSet({ key, value }),
      }),
    );

    return this.get(key);
  }

  async getMany(keys: Array<SETTINGS_KEYS>): Promise<SettingsOutputDTO[]> {
    const toReturn = await Promise.all(
      keys.map((key) => {
        return this.get(key);
      }),
    );

    return toReturn;
  }

  async getAll() {
    const all = await this.repo.getAll();
    return all;
  }
}
