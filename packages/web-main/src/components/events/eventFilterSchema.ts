import { z } from 'zod';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';

export const eventFilterSchema = z.object({
  dateRange: z
    .object({
      start: z.string().optional().catch(undefined),
      end: z.string().optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
  playerIds: z.array(z.string()).optional().default([]),
  gameServerIds: z.array(z.string()).optional().default([]),
  moduleIds: z.array(z.string()).optional().default([]),
  eventNames: z.array(z.nativeEnum(EventName)).optional().default([]),
});
