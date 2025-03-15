import {
  jsonShape,
  moduleDescriptionShape,
  moduleNameShape,
  modulePermissionShape,
} from '../../../../../../util/validationShapes';
import { z } from 'zod';
import Ajv from 'ajv';

const ajv = new Ajv({ useDefaults: true, allErrors: true, strictSchema: true });

export const validationSchema = z.object({
  name: moduleNameShape,
  description: moduleDescriptionShape,
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
