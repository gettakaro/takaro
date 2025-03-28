import { z } from 'zod';

export const moduleNameShape = z
  .string()
  .min(4, {
    message: 'Module name requires a minimum length of 4 characters',
  })
  .max(35, {
    message: 'Module name requires a maximum length of 35 characters',
  })
  .min(1, { message: 'Module name cannot be empty' });

export const moduleDescriptionShape = z
  .string()
  .max(500000, {
    message: 'Module description requires a maximum length of 500000 characters',
  })
  .optional();

export const modulePermissionShape = z.object({
  permission: z
    .string()
    .min(1, { message: 'Permission cannot be empty' })
    .refine((val) => !val.includes(' '), 'Spaces are not allowed.'),
  description: z.string(),
  friendlyName: z.string(),
  canHaveCount: z.boolean().optional(),
});

// JSON type: https://zod.dev/?id=json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonShape: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonShape), z.record(jsonShape)]),
);
