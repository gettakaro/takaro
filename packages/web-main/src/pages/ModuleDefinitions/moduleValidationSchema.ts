import { z } from 'zod';

export const moduleValidationSchema = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Module name requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Module name requires a maximum length of 25 characters',
    })
    .nonempty('Module name cannot be empty'),
  description: z
    .string()
    .max(100, {
      message: 'Module description requires a maximum length of 100 characters',
    })
    .optional(),
  permissions: z.array(
    z.object({
      permission: z.string().nonempty('Permission cannot be empty'),
      description: z.string().optional(),
      friendlyName: z.string().optional(),
    })
  ),
});
