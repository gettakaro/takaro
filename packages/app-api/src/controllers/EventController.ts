import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Post, JsonController, UseBefore, Req, Res, Get, Params, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { EVENT_TYPES, EventCreateDTO, EventOutputDTO, EventService } from '../service/EventService.js';
import { ParamId } from '../lib/validators.js';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { logger } from '@takaro/util';

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

const eventExtendOptions = ['module', 'gameServer', 'player', 'user'];
type EventExtendOptions = (typeof eventExtendOptions)[number];

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

  @IsOptional()
  @IsEnum(eventExtendOptions, { each: true })
  declare extend?: EventExtendOptions[];
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
  @Get('/event/export')
  @OpenAPI({
    summary: 'Export events to CSV',
    description:
      'Export events matching the search criteria to CSV format. Accepts the same parameters as the search endpoint. Maximum time range is 90 days.',
  })
  async export(@Req() req: AuthenticatedRequest, @Res() res: Response, @QueryParams() query: EventSearchInputDTO) {
    const service = new EventService(req.domainId);
    await service.exportToCsv(query, res);
    return res;
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
