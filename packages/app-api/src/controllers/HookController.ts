import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { HookCreateDTO, HookOutputDTO, HookService, HookTriggerDTO, HookUpdateDTO } from '../service/HookService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { EventTypes, HookEvents } from '@takaro/modules';
import { builtinModuleModificationMiddleware } from '../middlewares/builtinModuleModification.js';

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
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  moduleId!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsEnum({ ...HookEvents }, { each: true })
  eventType!: EventTypes[];
}

class HookSearchInputDTO extends ITakaroQuery<HookSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => HookSearchInputAllowedFilters)
  declare filters: HookSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => HookSearchInputAllowedFilters)
  declare search: HookSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class HookController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(HookOutputArrayDTOAPI)
  @Post('/hook/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: HookSearchInputDTO) {
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(HookOutputDTOAPI)
  @Get('/hook/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(HookOutputDTOAPI)
  @Post('/hook')
  async create(@Req() req: AuthenticatedRequest, @Body() data: HookCreateDTO) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(HookOutputDTOAPI)
  @Put('/hook/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: HookUpdateDTO) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/hook/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    await service.delete(params.id);
    return apiResponse(new IdUuidDTO({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @Post('/hook/trigger')
  @OpenAPI({
    description: `Trigger a hook. This is used for testing purposes, the event will not actually be created but the hook-logic will be executed. 
    You can pass any data you want, but it must validate against the corresponding event metadata. Eg to trigger the \`chat-message\` event, you must pass an object with a \`message\` property`,
  })
  async trigger(@Req() req: AuthenticatedRequest, @Body() data: HookTriggerDTO) {
    const service = new HookService(req.domainId);
    await service.trigger(data);
    return apiResponse();
  }
}
