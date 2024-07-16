import Ajv from 'ajv';
import ms from 'ms';
import { DiscordEvents } from '@takaro/modules';
import { ModuleOutputDTO } from '../service/ModuleService.js';
import { ModuleOutputDTO as ModuleOutputDTOApi } from '@takaro/apiclient';

export function getEmptyConfigSchema(): Ajv.AnySchemaObject {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

export function getSystemConfigSchema(mod: ModuleOutputDTO | ModuleOutputDTOApi): string {
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
        },
        required: [],
        default: {},
      };

      if (hook.eventType === DiscordEvents.DISCORD_MESSAGE) {
        if (!systemConfigSchema.required.includes('hooks')) {
          systemConfigSchema.required.push('hooks');
        }

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
