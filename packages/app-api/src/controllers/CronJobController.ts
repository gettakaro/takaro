import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse, PaginatedRequest } from '@takaro/http';
import {
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobService,
  CronJobUpdateDTO,
} from '../service/CronJobService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
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
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';
import { CAPABILITIES } from '../service/RoleService';

export class CronJobOutputDTOAPI extends APIOutput<CronJobOutputDTO> {
  @Type(() => CronJobOutputDTO)
  @ValidateNested()
  data!: CronJobOutputDTO;
}

export class CronJobOutputArrayDTOAPI extends APIOutput<CronJobOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => CronJobOutputDTO)
  data!: CronJobOutputDTO[];
}

class CronJobSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  enabled!: string;
}

class CronJobSearchInputDTO extends ITakaroQuery<CronJobSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => CronJobSearchInputAllowedFilters)
  filters!: CronJobSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class CronJobController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_CRONJOBS]))
  @ResponseSchema(CronJobOutputArrayDTOAPI)
  @Post('/cronjob/search')
  async search(
    @Req() req: AuthenticatedRequest & PaginatedRequest,
    @Body() query: CronJobSearchInputDTO
  ) {
    const service = new CronJobService(req.domainId);
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_CRONJOBS]))
  @ResponseSchema(CronJobOutputDTOAPI)
  @Get('/cronjob/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_CRONJOBS]))
  @ResponseSchema(CronJobOutputDTOAPI)
  @Post('/cronjob')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CronJobCreateDTO
  ) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_CRONJOBS]))
  @ResponseSchema(CronJobOutputDTOAPI)
  @Put('/cronjob/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CronJobUpdateDTO
  ) {
    const service = new CronJobService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_CRONJOBS]))
  @ResponseSchema(APIOutput)
  @Delete('/cronjob/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CronJobService(req.domainId);
    const deletedRecord = await service.delete(params.id);
    return apiResponse(deletedRecord);
  }
}
