import { z } from 'zod';

export const validationSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.record(z.boolean()),
});

export const playerRoleAssignValidationSchema = z.object({
  id: z.string().uuid().nonempty(),
  roleIds: z.string().uuid().array(),
  gameServerId: z.string().nonempty(),
});

export const userRoleAssignValidationschema = z.object({
  id: z.string().uuid().nonempty(),
  roleIds: z.string().uuid().array(),
});
