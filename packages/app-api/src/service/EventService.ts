import { TakaroService } from './Base.js';

import { IsEnum, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, ctx, errors, isTakaroDTO, traceableClass, PostHog } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { EventModel, EventRepo, Filter, FilterGroup } from '../db/event.js';
import { getSocketServer } from '../lib/socketServer.js';
import { PlayerOutputDTO } from './Player/dto.js';
import { Type } from 'class-transformer';
import { GameServerOutputDTO } from './GameServerService.js';
import { ModuleOutputDTO } from './Module/dto.js';
import { UserOutputDTO } from './User/index.js';
import { BaseEvent, EventMapping, EventPayload, TakaroEvents } from '@takaro/modules';
import { ValueOf } from 'type-fest';
import { HookService } from './HookService.js';
import { eventsMetric } from '../lib/metrics.js';
import { Response } from 'express';
import { stringify } from 'csv-stringify';

export const EVENT_TYPES = {
  ...TakaroEvents,
  // All game events except for LOG_LINE because it would get too spammy
  PLAYER_CONNECTED: 'player-connected',
  PLAYER_DISCONNECTED: 'player-disconnected',
  CHAT_MESSAGE: 'chat-message',
  PLAYER_DEATH: 'player-death',
  ENTITY_KILLED: 'entity-killed',
} as const;

export type EventTypes = ValueOf<typeof EVENT_TYPES>;

export class EventOutputDTO extends TakaroModelDTO<EventOutputDTO> {
  @IsEnum(EVENT_TYPES)
  eventName!: EventTypes;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsUUID()
  playerId!: string;

  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  gameserverId!: string;

  @IsOptional()
  @IsUUID()
  actingUserId!: string;

  @IsOptional()
  @IsUUID()
  actingModuleId!: string;

  @IsOptional()
  @IsObject()
  meta: EventPayload;

  @IsOptional()
  @Type(() => PlayerOutputDTO)
  @ValidateNested()
  player: typeof PlayerOutputDTO;

  @IsOptional()
  @Type(() => GameServerOutputDTO)
  @ValidateNested()
  gameServer: typeof GameServerOutputDTO;

  @IsOptional()
  @Type(() => ModuleOutputDTO)
  @ValidateNested()
  module: typeof ModuleOutputDTO;

  @IsOptional()
  @Type(() => UserOutputDTO)
  @ValidateNested()
  user: typeof UserOutputDTO;
}

export class EventCreateDTO extends TakaroDTO<EventCreateDTO> {
  @IsEnum(EVENT_TYPES)
  eventName!: EventTypes;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsUUID()
  playerId!: string;

  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  gameserverId!: string;

  @IsOptional()
  @IsUUID()
  actingUserId!: string;

  @IsOptional()
  @IsUUID()
  actingModuleId!: string;

  @IsOptional()
  @IsObject()
  meta: BaseEvent<any>;
}

export class EventUpdateDTO extends TakaroDTO<EventUpdateDTO> {}

// Helper function to flatten nested objects for CSV export
function flattenObject(obj: any, prefix = '', maxDepth = 5, currentDepth = 0): Record<string, any> {
  const flattened: Record<string, any> = {};

  // Handle null/undefined/non-object inputs
  if (obj === null || obj === undefined) {
    return { [prefix || 'value']: '' };
  }

  if (typeof obj !== 'object' || obj instanceof Date) {
    return { [prefix || 'value']: obj };
  }

  if (currentDepth >= maxDepth) {
    return { [prefix]: JSON.stringify(obj) };
  }

  // Handle empty objects
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return { [prefix || 'value']: '{}' };
  }

  for (const [key, value] of entries) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (Array.isArray(value)) {
      // For arrays, handle empty arrays and stringify non-empty ones
      if (value.length === 0) {
        flattened[newKey] = '[]';
      } else if (value.every((item) => typeof item !== 'object' || item === null)) {
        // Simple array of primitives
        flattened[newKey] = value.join(', ');
      } else {
        // Complex array with objects
        flattened[newKey] = JSON.stringify(value);
      }
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      // Recursively flatten nested objects
      try {
        const nested = flattenObject(value, newKey, maxDepth, currentDepth + 1);
        Object.assign(flattened, nested);
      } catch {
        // If there's a circular reference or other error, stringify it
        flattened[newKey] = '[Object]';
      }
    } else {
      // Primitive values - ensure they're string-safe
      flattened[newKey] = String(value);
    }
  }

  return flattened;
}

@traceableClass('service:event')
export class EventService extends TakaroService<EventModel, EventOutputDTO, EventCreateDTO, EventUpdateDTO> {
  get repo() {
    return new EventRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<EventOutputDTO>): Promise<PaginatedOutput<EventOutputDTO>> {
    const res = await this.repo.find(filters);

    res.results = res.results.map((event) => {
      if (event.gameServer) {
        if ('connectionInfo' in event.gameServer) delete event.gameServer.connectionInfo;
      }

      return event;
    });

    return res;
  }

  findOne(id: string): Promise<EventOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(data: EventCreateDTO): Promise<EventOutputDTO> {
    const dto = EventMapping[data.eventName];
    if (!dto) throw new errors.BadRequestError(`Event ${data.eventName} is not supported`);

    let eventMeta: BaseEvent<any> | null = null;

    // If no userId is provided, use the calling user
    if (!data.actingUserId && ctx.data.user) data.actingUserId = ctx.data.user;
    if (!data.actingModuleId && ctx.data.module) data.actingModuleId = ctx.data.module;

    if (!isTakaroDTO(data.meta)) {
      eventMeta = new dto(data.meta);
    } else {
      eventMeta = data.meta;
    }

    await eventMeta.validate();

    const created = await this.repo.create(data);

    this.log.info(`Event ${created.eventName} created`, { id: created.id });
    this.log.debug('[CONCURRENT_TESTS_DEBUG] Event created in database', {
      eventName: created.eventName,
      eventId: created.id,
      playerId: created.playerId,
      gameserverId: created.gameserverId,
      domainId: this.domainId,
    });

    eventsMetric.inc({
      event: created.eventName,
      player: created.playerId || 'none',
      gameserver: created.gameserverId || 'none',
      module: created.moduleId || 'none',
      domain: this.domainId,
    });

    const hookService = new HookService(this.domainId);
    await hookService.handleEvent({
      eventType: created.eventName,
      eventData: eventMeta,
      gameServerId: created.gameserverId,
      playerId: created.playerId,
    });

    try {
      // Check if domain is still active before emitting
      const { DomainService } = await import('./DomainService.js');
      const domainService = new DomainService();
      const domain = await domainService.findOne(this.domainId);

      this.log.debug('[CONCURRENT_TESTS_DEBUG] Domain state check before event emission', {
        domainId: this.domainId,
        domainState: domain?.state,
        domainExists: !!domain,
        eventName: created.eventName,
      });

      if (!domain || domain.state === 'DELETED') {
        this.log.warn('[CONCURRENT_TESTS_DEBUG] Skipping event emission for DELETED/missing domain', {
          domainId: this.domainId,
          domainState: domain?.state,
          eventName: created.eventName,
        });
        return created;
      }

      const socketServer = await getSocketServer();
      this.log.debug('[CONCURRENT_TESTS_DEBUG] About to emit event via Socket.IO', {
        eventName: created.eventName,
        eventId: created.id,
        domainId: this.domainId,
      });
      socketServer.emit(this.domainId, 'event', [created]);
      this.log.debug('[CONCURRENT_TESTS_DEBUG] Event emitted via Socket.IO', {
        eventName: created.eventName,
        eventId: created.id,
        domainId: this.domainId,
      });
    } catch (error) {
      this.log.warn('Failed to emit event', error);
    }

    const posthog = new PostHog(this.domainId);
    await posthog.trackEvent(created.eventName, {
      player: created.playerId,
      gameserver: created.gameserverId,
      module: created.moduleId,
      user: created.userId,
    });

    return created;
  }

  update(): Promise<EventOutputDTO> {
    throw new errors.BadRequestError('Events cannot be updated');
  }

  async delete(): Promise<string> {
    throw new errors.BadRequestError('Events cannot be deleted');
  }

  async metadataSearch(filters: ITakaroQuery<EventOutputDTO>, metaFilters: (Filter | FilterGroup)[]): Promise<any> {
    return this.repo.metadataSearch(filters, metaFilters);
  }

  async deleteOldEvents(olderThan: string) {
    return this.repo.deleteOldEvents(olderThan);
  }

  async exportToCsv(query: ITakaroQuery<EventOutputDTO>, res: Response): Promise<void> {
    // Parse and validate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.greaterThan?.createdAt && query.lessThan?.createdAt) {
      // Both dates provided
      startDate = new Date(query.greaterThan.createdAt as string);
      endDate = new Date(query.lessThan.createdAt as string);
    } else if (query.greaterThan?.createdAt && !query.lessThan?.createdAt) {
      // Only start date provided - use current time as end
      startDate = new Date(query.greaterThan.createdAt as string);
      endDate = now;
    } else if (!query.greaterThan?.createdAt && query.lessThan?.createdAt) {
      // Only end date provided - use 90 days before as start
      endDate = new Date(query.lessThan.createdAt as string);
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      // No dates provided - default to last 90 days
      endDate = now;
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Calculate the difference in days
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (24 * 60 * 60 * 1000);

    // Enforce 90-day limit
    if (diffInDays > 90) {
      throw new errors.BadRequestError(
        `Time range exceeds maximum allowed period of 90 days. Requested range is ${Math.ceil(diffInDays)} days. Please select a date range of 90 days or less.`,
      );
    }

    // Apply the validated date range to the query
    query.greaterThan = { ...query.greaterThan, createdAt: startDate.toISOString() };
    query.lessThan = { ...query.lessThan, createdAt: endDate.toISOString() };

    // Set CSV response headers
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `events_${currentDate}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Track event count for error reporting
    let eventCount = 0;

    try {
      this.log.info('CSV export started', {
        domainId: this.domainId,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil(diffInDays),
        },
      });

      // First, collect a sample of events to determine all possible columns
      const sampleResult = await this.find({
        ...query,
        limit: 1000, // Use same batch size as pagination for consistency
        page: 0,
      });

      // Check if there are no events
      const hasNoEvents = sampleResult.total === 0;

      // Collect all unique meta keys from the sample
      const metaKeys = new Set<string>();
      for (const event of sampleResult.results) {
        if (event.meta) {
          const flattened = flattenObject(event.meta, 'meta');
          Object.keys(flattened).forEach((key) => metaKeys.add(key));
        }
      }

      // Build dynamic columns including base fields and meta fields
      const baseColumns = [
        { key: 'id', header: 'id' },
        { key: 'eventName', header: 'eventName' },
        { key: 'moduleId', header: 'moduleId' },
        { key: 'moduleName', header: 'moduleName' },
        { key: 'playerId', header: 'playerId' },
        { key: 'playerName', header: 'playerName' },
        { key: 'userId', header: 'userId' },
        { key: 'userName', header: 'userName' },
        { key: 'gameserverId', header: 'gameserverId' },
        { key: 'gameserverName', header: 'gameserverName' },
        { key: 'actingUserId', header: 'actingUserId' },
        { key: 'actingModuleId', header: 'actingModuleId' },
      ];

      // Add meta columns dynamically
      const metaColumns = Array.from(metaKeys)
        .sort()
        .map((key) => ({
          key,
          header: key,
        }));

      const dateColumns = [
        { key: 'createdAt', header: 'createdAt' },
        { key: 'updatedAt', header: 'updatedAt' },
      ];

      const allColumns = [...baseColumns, ...metaColumns, ...dateColumns];

      // Configure CSV stringifier with dynamic columns
      const stringifier = stringify({
        header: true,
        columns: allColumns,
        delimiter: ',',
        quoted: true,
        quoted_empty: true,
        quoted_string: true,
        escape: '"',
      });

      // Pipe the stringifier stream directly to the HTTP response stream
      stringifier.pipe(res);

      // If there are no events, write a message row and end the stream
      if (hasNoEvents) {
        // Write a single row indicating no data found
        const emptyRow: Record<string, any> = {};
        for (const col of allColumns) {
          emptyRow[col.key] = col.key === 'eventName' ? 'No events found for the selected filters' : '';
        }
        stringifier.write(emptyRow);
        stringifier.end();

        this.log.info('CSV export completed - no events found', {
          domainId: this.domainId,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: Math.ceil(diffInDays),
          },
        });
        return;
      }

      // Create the stream pipeline
      const eventIterator = this.getIterator({
        ...query,
        limit: 1000, // Process 1000 events at a time for efficient batch processing
      });

      // Track export progress
      eventCount = 0;
      let lastLoggedCount = 0;
      const logInterval = 10000; // Log every 10,000 events

      // Process each event through the pipeline and write to CSV stream
      for await (const event of eventIterator) {
        eventCount++;

        // Log progress periodically
        if (eventCount - lastLoggedCount >= logInterval) {
          this.log.info('CSV export progress', {
            domainId: this.domainId,
            eventsProcessed: eventCount,
          });
          lastLoggedCount = eventCount;
        }

        // Start with base fields
        const row: Record<string, any> = {
          id: event.id,
          eventName: event.eventName,
          moduleId: event.moduleId || '',
          moduleName: event.module?.name || '',
          playerId: event.playerId || '',
          playerName: event.player?.name || '',
          userId: event.userId || '',
          userName: event.user?.name || '',
          gameserverId: event.gameserverId || '',
          gameserverName: event.gameServer?.name || '',
          actingUserId: event.actingUserId || '',
          actingModuleId: event.actingModuleId || '',
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        };

        // Add flattened metadata fields
        if (event.meta) {
          const flattenedMeta = flattenObject(event.meta, 'meta');
          // Ensure all meta columns have a value (empty string if missing)
          for (const metaKey of metaKeys) {
            row[metaKey] = flattenedMeta[metaKey] || '';
          }
        } else {
          // If no meta, fill all meta columns with empty strings
          for (const metaKey of metaKeys) {
            row[metaKey] = '';
          }
        }

        // Write the row to the CSV stream
        stringifier.write(row);
      }

      // End the stream when done
      stringifier.end();

      this.log.info('CSV export completed', {
        domainId: this.domainId,
        totalEvents: eventCount,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil(diffInDays),
        },
      });
    } catch (error) {
      const errorDetails = {
        domainId: this.domainId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        eventsProcessed: eventCount || 0,
      };

      this.log.error('CSV export failed', errorDetails);

      // If streaming has already started, we can't send a proper error response
      // The best we can do is end the stream
      if (res.headersSent) {
        res.end();
        return;
      }

      // Rethrow with appropriate Takaro error types
      if (error instanceof Error) {
        // Database connection errors
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
          throw new errors.InternalServerError();
        }
        // Query timeout errors
        else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          throw new errors.BadRequestError('Export timed out. Try reducing the date range or applying more filters.');
        }
        // Memory errors
        else if (error.message.includes('memory') || error.message.includes('heap')) {
          throw new errors.BadRequestError('Export too large. Please reduce the date range or apply more filters.');
        }
      }

      // For any other error, rethrow as InternalServerError
      throw new errors.InternalServerError();
    }
  }
}
