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
  @Type(() => EventSearchInputAllowedFilters)
  declare search: EventSearchInputAllowedFilters;
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
