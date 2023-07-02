import Ajv from 'ajv';
import ms from 'ms';
import { ModuleOutputDTO } from '../service/ModuleService.js';
import { DiscordEvents } from '@takaro/modules';

export function getEmptySystemConfigSchema(): Ajv.AnySchemaObject {
  return {
    type: 'object',
    properties: {},
    required: [],
  };
}

export function getSystemConfigSchema(mod: ModuleOutputDTO): string {
  const systemConfigSchema = getEmptySystemConfigSchema();

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
        type: 'string',
        default: cronJob.temporalValue,
      };
    }
  }

  if (mod.hooks.length) {
    for (const hook of mod.hooks) {
      if (hook.eventType === DiscordEvents.DISCORD_MESSAGE) {
        systemConfigSchema.properties.hooks = {
          type: 'object',
          properties: {},
          required: [],
          default: {},
        };

        systemConfigSchema.required.push('hooks');

        const configKey = `${hook.name} Discord channel ID`;

        systemConfigSchema.properties.hooks.properties[configKey] = {
          type: 'string',
          description:
            'Discord channel ID where Takaro will listen for messages.',
        };
        systemConfigSchema.properties.hooks.required.push(configKey);
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
        properties: {
          delay: {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: ms('1 day') / 1000,
            description:
              'How many seconds to wait before executing the command.',
          },
        },
        required: [],
        default: {},
      };
    }
  }

  return JSON.stringify(systemConfigSchema);
}
