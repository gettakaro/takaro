import { RoleCreateInputDTOPermissionsEnum } from '@takaro/apiclient';
import { z } from 'zod';

const permissionsSchema = Object.keys(RoleCreateInputDTOPermissionsEnum).reduce(
  (acc, permission) => ({ ...acc, [permission]: z.boolean() }),
  {}
);

export const validationSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.object(permissionsSchema),
});
