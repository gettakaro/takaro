import { z } from 'zod';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { fallback } from '@tanstack/zod-adapter';

export const eventFilterSchema = z.object({
  dateRange: z
    .object({
      start: z.string().optional().catch(undefined),
      end: z.string().optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
  playerIds: fallback(z.array(z.string()), []).optional().default([]),
  gameServerIds: fallback(z.array(z.string()), []).optional().default([]),
  moduleIds: fallback(z.array(z.string()), []).optional().default([]),
  eventNames: fallback(z.array(z.nativeEnum(EventName)), [])
    .optional()
    .default([]),
});
