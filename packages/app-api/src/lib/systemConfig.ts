import Ajv from 'ajv';
import { ModuleOutputDTO } from '../service/ModuleService.js';

export function getEmptySystemConfigSchema(): Ajv.AnySchemaObject {
  return {
    type: 'object',
    properties: {
      cronJobs: {
        type: 'object',
        properties: {},
        required: [],
        default: {},
      },
    },
    required: [],
  };
}

export function getSystemConfigSchema(mod: ModuleOutputDTO): string {
  const systemConfigSchema = getEmptySystemConfigSchema();

  if (mod.cronJobs.length) {
    systemConfigSchema.required.push('cronJobs');

    for (const cronJob of mod.cronJobs) {
      systemConfigSchema.properties.cronJobs.properties[cronJob.name] = {
        type: 'string',
        default: cronJob.temporalValue,
      };
    }
  }

  return JSON.stringify(systemConfigSchema);
}
