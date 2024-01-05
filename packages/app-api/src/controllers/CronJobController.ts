import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
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
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { builtinModuleModificationMiddleware } from '../middlewares/builtinModuleModification.js';

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

class CronJobSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  moduleId!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class CronJobSearchInputDTO extends ITakaroQuery<CronJobSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => CronJobSearchInputAllowedFilters)
  declare filters: CronJobSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => CronJobSearchInputAllowedFilters)
  declare search: CronJobSearchInputAllowedFilters;
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CronJobOutputDTOAPI)
  @Post('/cronjob')
  async create(@Req() req: AuthenticatedRequest, @Body() data: CronJobCreateDTO) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CronJobOutputDTOAPI)
  @Put('/cronjob/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: CronJobUpdateDTO) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/cronjob/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CronJobService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @Post('/cronjob/trigger')
  async trigger(@Req() req: AuthenticatedRequest, @Body() data: CronJobTriggerDTO) {
    const service = new CronJobService(req.domainId);
    await service.trigger(data);
    return apiResponse();
  }
}
