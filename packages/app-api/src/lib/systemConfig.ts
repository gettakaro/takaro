import Ajv from 'ajv';
import ms from 'ms';
import dedent from 'dedent';
import { DiscordEvents } from '@takaro/modules';
import { ModuleVersionOutputDTO } from '../service/Module/dto.js';
import { ModuleVersionOutputDTO as ModuleVersionOutputDTOApi } from '@takaro/apiclient';

export function getEmptyConfigSchema(): Ajv.AnySchemaObject {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

export function getEmptyUiSchema() {
  return {};
}

export function getSystemConfigSchema(mod: ModuleVersionOutputDTO | ModuleVersionOutputDTOApi): string {
  const systemConfigSchema = getEmptyConfigSchema();

  systemConfigSchema.properties.enabled = {
    type: 'boolean',
    default: true,
    description: 'Enable/disable the module without having to uninstall it.',
  };

  if (mod.cronJobs.length) {
    systemConfigSchema.properties.cronJobs = {
      type: 'object',
      properties: {},
      required: [],
      default: {},
    };

    systemConfigSchema.required.push('cronJobs');

    for (const cronJob of mod.cronJobs) {
      systemConfigSchema.properties.cronJobs.properties[cronJob.name] = {
        type: 'object',
        required: [],
        default: {},
        properties: {
          enabled: {
            type: 'boolean',
            default: true,
            description: `Enable the ${cronJob.name} cron job.`,
          },
          temporalValue: {
            type: 'string',
            description: 'Temporal value for the cron job. Controls when it runs',
            default: cronJob.temporalValue,
          },
        },
      };
    }
  }

  if (mod.hooks.length) {
    systemConfigSchema.properties.hooks = {
      type: 'object',
      properties: {},
      required: [],
      default: {},
    };

    for (const hook of mod.hooks) {
      systemConfigSchema.properties.hooks.properties[hook.name] = {
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            default: true,
            description: `Enable the ${hook.name} hook.`,
          },
          delay: {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: ms('1 day') / 1000,
            description: 'How many seconds to wait before executing the hook.',
          },
          cooldown: {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: ms('1 day') / 1000,
            description: 'How many seconds before this hook can be triggered again.',
          },
          cooldownType: {
            type: 'string',
            enum: ['player', 'server', 'global'],
            default: 'player',
            description: dedent`When a cooldown time is set, this determines the scope of the cooldown.
            If set to 'player', the target player will have to wait before triggering the hook again.
            If set to 'server', the cooldown will apply to all players on the server.
            If set to 'global', the cooldown will apply to the entire domain.
            
            Note that if you select 'player' but the hook fires for an event that has no player attached (e.g. a server goes on/offline), the cooldown will be treated as a server cooldown instead.`,
          },
        },
        required: [],
        default: {},
      };

      if (hook.eventType === DiscordEvents.DISCORD_MESSAGE) {
        if (!systemConfigSchema.required.includes('hooks')) {
          systemConfigSchema.required.push('hooks');
        }

        systemConfigSchema.properties.hooks.properties[hook.name].required.push('discordChannelId');
        systemConfigSchema.properties.hooks.properties[hook.name].properties.discordChannelId = {
          type: 'string',
          description: 'Discord channel ID where Takaro will listen for messages.',
        };
      }
    }
  }

  if (mod.commands.length) {
    systemConfigSchema.properties.commands = {
      type: 'object',
      properties: {},
      required: [],
      default: {},
    };

    systemConfigSchema.required.push('commands');

    for (const command of mod.commands) {
      const configKey = command.name;

      systemConfigSchema.properties.commands.properties[configKey] = {
        type: 'object',
        properties: {},
        required: [],
        default: {},
      };

      systemConfigSchema.properties.commands.properties[configKey] = {
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            default: true,
            description: `Enable the ${configKey} command.`,
          },
          delay: {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: ms('1 day') / 1000,
            description: 'How many seconds to wait before executing the command.',
          },
          announceDelay: {
            type: 'boolean',
            default: true,
            description: 'Whether to announce the delay to the user.',
          },
          cooldown: {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: ms('7 days') / 1000,
            description: 'How many seconds a player has to wait before executing the command again.',
          },
          cost: {
            type: 'number',
            default: 0,
            minimum: 0,
            description: 'How much currency to deduct from the player before executing the command.',
          },
          aliases: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Trigger the command with other names than the default',
          },
        },
        required: [],
        default: {},
      };
    }
  }

  return JSON.stringify(systemConfigSchema);
}
