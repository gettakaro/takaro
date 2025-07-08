import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Post, JsonController, UseBefore, Req, Res, Get, Params } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { EVENT_TYPES, EventCreateDTO, EventOutputDTO, EventService } from '../service/EventService.js';
import { ParamId } from '../lib/validators.js';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { stringify } from 'csv-stringify';
import { logger } from '@takaro/util';

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to get memory usage info
function getMemoryInfo() {
  const usage = process.memoryUsage();
  return {
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal),
    rss: formatBytes(usage.rss),
    external: formatBytes(usage.external),
  };
}

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

class EventSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID('4', { each: true })
  id!: string[];
  @IsOptional()
  @IsEnum(EVENT_TYPES, { each: true })
  eventName!: string[];
  @IsOptional()
  @IsString({ each: true })
  moduleId!: string[];
  @IsOptional()
  @IsString({ each: true })
  playerId!: string[];
  @IsOptional()
  @IsString({ each: true })
  gameserverId!: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  actingUserId!: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  actingModuleId!: string[];
}

export class EventSearchInputDTO extends ITakaroQuery<EventOutputDTO> {
  @ValidateNested()
  @Type(() => EventSearchInputAllowedFilters)
  declare filters: EventSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;
}

export class EventOutputArrayDTOAPI extends APIOutput<EventOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => EventOutputDTO)
  declare data: EventOutputDTO[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class EventController {
  private log = logger('EventController');
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_EVENTS]))
  @ResponseSchema(EventOutputArrayDTOAPI)
  @Post('/event/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: EventSearchInputDTO) {
    const service = new EventService(req.domainId);
    const result = await service.find({
      ...query,
      page: res.locals.page,
      limit: res.locals.limit,
    });
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_EVENTS]))
  @Post('/event/count')
  @OpenAPI({
    summary: 'Get event count',
    description:
      'Get the total count of events matching the search criteria. Useful for checking export size before downloading.',
  })
  async count(@Req() req: AuthenticatedRequest, @Body() query: EventSearchInputDTO) {
    const service = new EventService(req.domainId);
    const result = await service.find({
      ...query,
      page: 0,
      limit: 1, // We only need the total count
    });
    return apiResponse({ count: result.total });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_EVENTS]))
  @Post('/event/export')
  @OpenAPI({
    summary: 'Export events to CSV',
    description:
      'Export events matching the search criteria to CSV format. Accepts the same parameters as the search endpoint. Maximum time range is 90 days.',
  })
  async export(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: EventSearchInputDTO) {
    // Validate time range - enforce 90-day maximum
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.greaterThan?.createdAt && query.lessThan?.createdAt) {
      // Both dates provided
      startDate = new Date(query.greaterThan.createdAt);
      endDate = new Date(query.lessThan.createdAt);
    } else if (query.greaterThan?.createdAt) {
      // Only start date provided
      startDate = new Date(query.greaterThan.createdAt);
      endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Add 90 days
      if (endDate > now) endDate = now;
    } else if (query.lessThan?.createdAt) {
      // Only end date provided
      endDate = new Date(query.lessThan.createdAt);
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // Subtract 90 days
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
      return res.status(400).json({
        error: 'Time range exceeds maximum allowed period of 90 days',
        message: `Requested range is ${Math.ceil(diffInDays)} days. Please select a date range of 90 days or less.`,
      });
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
      const service = new EventService(req.domainId);

      // Log initial memory usage
      const initialMemory = getMemoryInfo();
      this.log.info('CSV export started', {
        domainId: req.domainId,
        memory: initialMemory,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil(diffInDays),
        },
      });

      // First, collect a sample of events to determine all possible columns
      const sampleResult = await service.find({
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
      // Note: csv-stringify returns a Transform stream that efficiently handles data
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
      // This ensures efficient memory usage even for large exports
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
          domainId: req.domainId,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: Math.ceil(diffInDays),
          },
        });
        return;
      }

      // Create the stream pipeline:
      // Database (cursor) → Iterator (batches) → Processing → CSV Stream → HTTP Response
      // The getIterator method acts like a database cursor, fetching data in chunks
      // to avoid loading the entire dataset into memory at once
      const eventIterator = service.getIterator({
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
          const currentMemory = getMemoryInfo();
          this.log.info('CSV export progress', {
            domainId: req.domainId,
            eventsProcessed: eventCount,
            memory: currentMemory,
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

      // Log final statistics
      const finalMemory = getMemoryInfo();
      this.log.info('CSV export completed', {
        domainId: req.domainId,
        totalEvents: eventCount,
        memory: finalMemory,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil(diffInDays),
        },
      });
    } catch (error) {
      // Log error with memory info
      const errorMemory = getMemoryInfo();
      const errorDetails = {
        domainId: req.domainId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        eventsProcessed: eventCount || 0,
        memory: errorMemory,
      };

      this.log.error('CSV export failed', errorDetails);

      // Handle specific error types
      let statusCode = 500;
      let errorMessage = 'Export failed';

      if (error instanceof Error) {
        // Database connection errors
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
          statusCode = 503;
          errorMessage = 'Database connection failed. Please try again later.';
        }
        // Query timeout errors
        else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          statusCode = 504;
          errorMessage = 'Export timed out. Try reducing the date range or applying more filters.';
        }
        // Memory errors
        else if (error.message.includes('memory') || error.message.includes('heap')) {
          statusCode = 507;
          errorMessage = 'Export too large. Please reduce the date range or apply more filters.';
        }
        // Validation errors (should have been caught earlier, but just in case)
        else if (error.message.includes('validation') || error.message.includes('90 days')) {
          statusCode = 400;
          errorMessage = error.message;
        }
      }

      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        res.status(statusCode).json({
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        });
      } else {
        // If streaming has already started, we can't send a proper error response
        // The best we can do is end the stream
        res.end();
      }
    }
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_EVENTS]))
  @ResponseSchema(EventOutputDTO)
  @Post('/event')
  async create(@Req() req: AuthenticatedRequest, @Body() data: EventCreateDTO) {
    const service = new EventService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES, PERMISSIONS.READ_EVENTS]))
  @ResponseSchema(EventOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Get failed functions',
    description: 'Fetches events where cronjob, hook and command failed. Supports all the common query parameters',
  })
  @Post('/event/filter/failed-functions')
  async getFailedFunctions(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: EventSearchInputDTO) {
    const service = new EventService(req.domainId);
    const result = await service.metadataSearch(
      {
        ...query,
        filters: {
          ...query.filters,
          eventName: [EVENT_TYPES.COMMAND_EXECUTED, EVENT_TYPES.CRONJOB_EXECUTED, EVENT_TYPES.HOOK_EXECUTED],
        },
      },
      [
        {
          logicalOperator: 'AND',
          filters: [{ field: 'result.success', operator: '=', value: false }],
        },
      ],
    );

    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_EVENTS]))
  @ResponseSchema(EventOutputDTO)
  @Get('/event/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new EventService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }
}
