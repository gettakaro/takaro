import { z } from 'zod';

export const validationSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.record(
    z.object({
      enabled: z.boolean().optional(),
      count: z.number().optional(),
    })
  ),
});

export const roleAssignValidationSchema = z.object({
  id: z.string().uuid(),
  roleId: z.string().uuid(),
  gameServerId: z.string().optional(),
  expiresAt: z.string().optional(),
});
