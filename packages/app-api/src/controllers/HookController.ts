import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { GameEvents } from '@takaro/gameserver';
import {
  HookCreateDTO,
  HookOutputDTO,
  HookService,
  HookTriggerDTO,
  HookUpdateDTO,
} from '../service/HookService.js';
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
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { DiscordEvents, HookEventTypes } from '@takaro/modules';

export class HookOutputDTOAPI extends APIOutput<HookOutputDTO> {
  @Type(() => HookOutputDTO)
  @ValidateNested()
  declare data: HookOutputDTO;
}

export class HookOutputArrayDTOAPI extends APIOutput<HookOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => HookOutputDTO)
  declare data: HookOutputDTO[];
}

class HookSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum({ ...GameEvents, ...DiscordEvents })
  eventType!: HookEventTypes;
}

class HookSearchInputDTO extends ITakaroQuery<HookSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => HookSearchInputAllowedFilters)
  declare filters: HookSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class HookController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_HOOKS]))
  @ResponseSchema(HookOutputArrayDTOAPI)
  @Post('/hook/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: HookSearchInputDTO
  ) {
    const service = new HookService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Get('/hook/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Post('/hook')
  async create(@Req() req: AuthenticatedRequest, @Body() data: HookCreateDTO) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Put('/hook/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: HookUpdateDTO
  ) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_HOOKS]))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/hook/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_HOOKS]))
  @Post('/hook/trigger')
  async trigger(
    @Req() req: AuthenticatedRequest,
    @Body() data: HookTriggerDTO
  ) {
    const service = new HookService(req.domainId);
    await service.trigger(data);
    return apiResponse();
  }
}
