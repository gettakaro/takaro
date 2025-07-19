import {
  jsonShape,
  moduleDescriptionShape,
  moduleNameShape,
  modulePermissionShape,
} from '../../../../../../util/validationShapes';
import { z } from 'zod';
import Ajv from 'ajv';

const ajv = new Ajv({ useDefaults: true, allErrors: true, strictSchema: true });
ajv.addKeyword('x-component');

export const validationSchema = z.object({
  name: moduleNameShape,
  description: moduleDescriptionShape,
  author: z.string().optional(),
  supportedGames: z.array(z.enum(['all', 'other', 'minecraft', '7 days to die', 'rust'])).optional(),
  permissions: z.array(modulePermissionShape),
  configSchema: z.string().superRefine(async (value, ctx) => {
    try {
      ajv.compile(JSON.parse(value));
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid schema',
      });
      return false;
    }
  }),
  uiSchema: jsonShape,
});
