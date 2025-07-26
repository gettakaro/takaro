import { TakaroDTO, TakaroModelDTO, ctx, traceableClass, errors } from '@takaro/util';
import { IsEnum, IsString, IsBoolean } from 'class-validator';
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
  developerMode = 'developerMode',
  messagePrefix = 'messagePrefix',
  domainName = 'domainName',
  discordRoleSyncEnabled = 'discordRoleSyncEnabled',
  discordRoleSyncPreferDiscord = 'discordRoleSyncPreferDiscord',
}

export interface SettingDefinition {
  defaultValue: string;
  description: string;
  canHaveGameServerOverride: boolean;
}

export const SETTINGS_DEFINITIONS: Record<SETTINGS_KEYS, SettingDefinition> = {
  commandPrefix: {
    defaultValue: '/',
    description: 'The prefix character(s) that players must use before commands in chat',
    canHaveGameServerOverride: true,
  },
  serverChatName: {
    defaultValue: 'Takaro',
    description: 'The name displayed when Takaro sends messages in game chat',
    canHaveGameServerOverride: true,
  },
  economyEnabled: {
    defaultValue: 'false',
    description: 'Enable or disable the economy system for earning and spending currency',
    canHaveGameServerOverride: true,
  },
  currencyName: {
    defaultValue: 'Takaro coins',
    description: 'The name of the currency used in the economy system',
    canHaveGameServerOverride: true,
  },
  developerMode: {
    defaultValue: 'false',
    description: 'Enable developer mode for custom modules and advanced features',
    canHaveGameServerOverride: false,
  },
  messagePrefix: {
    defaultValue: '',
    description: 'A prefix added to all messages sent by Takaro in game chat',
    canHaveGameServerOverride: true,
  },
  domainName: {
    defaultValue: '',
    description: 'The domain name for this Takaro instance',
    canHaveGameServerOverride: false,
  },
  discordRoleSyncEnabled: {
    defaultValue: 'false',
    description: 'Enable or disable automatic role synchronization between Discord and Takaro',
    canHaveGameServerOverride: false,
  },
  discordRoleSyncPreferDiscord: {
    defaultValue: 'false',
    description:
      'When enabled, Discord roles will override Takaro roles during synchronization. When disabled, Takaro roles will override Discord roles. Only affects roles that are linked between systems.',
    canHaveGameServerOverride: false,
  },
};

export const DEFAULT_SETTINGS: Record<SETTINGS_KEYS, string> = Object.entries(SETTINGS_DEFINITIONS).reduce(
  (acc, [key, definition]) => {
    acc[key as SETTINGS_KEYS] = definition.defaultValue;
    return acc;
  },
  {} as Record<SETTINGS_KEYS, string>,
);
export class Settings extends TakaroModelDTO<Settings> {
  @IsString()
  commandPrefix: string;
  @IsString()
  serverChatName: string;
  @IsString()
  economyEnabled: string;
  @IsString()
  currencyName: string;
  @IsString()
  developerMode: string;
  @IsString()
  messagePrefix: string;
  @IsString()
  domainName: string;
  @IsString()
  discordRoleSyncEnabled: string;
  @IsString()
  discordRoleSyncPreferDiscord: string;
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

  @IsString()
  description: string;

  @IsBoolean()
  canHaveGameServerOverride: boolean;
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

  find(): Promise<PaginatedOutput<never>> {
    // Use the "getAll" method instead
    throw new errors.NotImplementedError();
  }

  findOne(): Promise<never> {
    // Use the "get" method instead
    throw new errors.NotImplementedError();
  }

  create(): Promise<never> {
    // Use the "init" (created DB record) or "set" (changing a settings value) method instead
    throw new errors.NotImplementedError();
  }

  delete(): Promise<string> {
    // This will cascade when a domain or gameserver is deleted
    throw new errors.NotImplementedError();
  }

  update(): Promise<never> {
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

  async getMany(keys: SETTINGS_KEYS[]): Promise<SettingsOutputDTO[]> {
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
