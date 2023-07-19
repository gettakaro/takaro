import { z } from 'zod';

export const validationSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.record(z.boolean()),
});
