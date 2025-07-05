import { IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobService,
  CronJobTriggerDTO,
  CronJobUpdateDTO,
} from '../service/CronJobService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import {
  Body,
  Get,
  Post,
  Delete,
  JsonController,
  UseBefore,
  Req,
  Put,
  Params,
  Res,
  QueryParam,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { moduleProtectionMiddleware } from '../middlewares/moduleProtectionMiddleware.js';
import { EventService, EVENT_TYPES } from '../service/EventService.js';
import { EventOutputArrayDTOAPI, EventSearchInputDTO } from './EventController.js';
import { AllowedFilters, AllowedSearch } from './shared.js';

export class CronJobOutputDTOAPI extends APIOutput<CronJobOutputDTO> {
  @Type(() => CronJobOutputDTO)
  @ValidateNested()
  declare data: CronJobOutputDTO;
}

export class CronJobOutputArrayDTOAPI extends APIOutput<CronJobOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => CronJobOutputDTO)
  declare data: CronJobOutputDTO[];
}

class CronJobSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  moduleId!: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  versionId!: string[];
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class CronJobSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

const cronJobExtendOptions = ['module', 'gameServer'];
type CronJobExtendOptions = (typeof cronJobExtendOptions)[number];

export class CronJobSearchInputDTO extends ITakaroQuery<CronJobSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => CronJobSearchInputAllowedFilters)
  declare filters: CronJobSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => CronJobSearchInputAllowedSearch)
  declare search: CronJobSearchInputAllowedSearch;

  @IsOptional()
  @IsEnum(cronJobExtendOptions, { each: true })
  declare extend?: CronJobExtendOptions[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class CronJobController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(CronJobOutputArrayDTOAPI)
  @Post('/cronjob/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: CronJobSearchInputDTO) {
    const service = new CronJobService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(CronJobOutputDTOAPI)
  @Get('/cronjob/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(CronJobOutputDTOAPI)
  @Post('/cronjob')
  async create(@Req() req: AuthenticatedRequest, @Body() data: CronJobCreateDTO) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(CronJobOutputDTOAPI)
  @Put('/cronjob/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: CronJobUpdateDTO) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(APIOutput)
  @Delete('/cronjob/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CronJobService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @Post('/cronjob/trigger')
  async trigger(@Req() req: AuthenticatedRequest, @Body() data: CronJobTriggerDTO) {
    const service = new CronJobService(req.domainId);
    await service.trigger(data);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(EventOutputArrayDTOAPI)
  @Post('/cronjob/:id/executions')
  async getExecutions(
    @Params() params: ParamId,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: EventSearchInputDTO,
    @QueryParam('success') success = false,
  ) {
    const service = new EventService(req.domainId);
    const result = await service.metadataSearch(
      {
        ...query,
        filters: { ...query.filters, eventName: [EVENT_TYPES.CRONJOB_EXECUTED] },
      },
      [
        {
          logicalOperator: 'AND',
          filters: [
            { field: 'cronjob.id', operator: '=', value: params.id },
            { field: 'result.success', operator: '=', value: success },
          ],
        },
      ],
    );

    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }
}
