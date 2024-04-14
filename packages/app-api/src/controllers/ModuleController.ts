import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ModuleCreateDTO, ModuleOutputDTO, ModuleService, ModuleUpdateDTO } from '../service/ModuleService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { errors } from '@takaro/util';
import { builtinModuleModificationMiddleware } from '../middlewares/builtinModuleModification.js';
import { BuiltinModule, ICommand, ICronJob, IHook, IFunction } from '@takaro/modules';

export class ModuleOutputDTOAPI extends APIOutput<ModuleOutputDTO> {
  @Type(() => ModuleOutputDTO)
  @ValidateNested()
  declare data: ModuleOutputDTO;
}

export class ModuleOutputArrayDTOAPI extends APIOutput<ModuleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ModuleOutputDTO)
  declare data: ModuleOutputDTO[];
}

class ModuleSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class ModuleSearchInputDTO extends ITakaroQuery<ModuleSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  declare filters: ModuleSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  declare search: ModuleSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class ModuleController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleOutputArrayDTOAPI)
  @Post('/module/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ModuleSearchInputDTO) {
    const service = new ModuleService(req.domainId);
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
  @ResponseSchema(ModuleOutputDTOAPI)
  @Get('/module/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @Post('/module')
  async create(@Req() req: AuthenticatedRequest, @Body() data: ModuleCreateDTO) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(ModuleOutputDTOAPI)
  @Put('/module/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ModuleUpdateDTO) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/module/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    await service.delete(params.id);
    return apiResponse(new IdUuidDTO({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @Post('/module/export/:id')
  async export(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);

    if (!mod) throw new errors.NotFoundError('Module not found');

    const output = new BuiltinModule(mod.name, mod.description, mod.configSchema, mod.uiSchema);

    output.commands = await Promise.all(
      mod.commands.map(
        (_) =>
          new ICommand({
            function: _.function.code,
            name: _.name,
            trigger: _.trigger,
            helpText: _.helpText,
            arguments: _.arguments,
          })
      )
    );

    output.hooks = await Promise.all(
      mod.hooks.map(
        (_) =>
          new IHook({
            function: _.function.code,
            name: _.name,
            eventType: _.eventType,
          })
      )
    );

    output.cronJobs = await Promise.all(
      mod.cronJobs.map(
        (_) =>
          new ICronJob({
            function: _.function.code,
            name: _.name,
            temporalValue: _.temporalValue,
          })
      )
    );

    output.functions = await Promise.all(
      mod.functions.map(
        (_) =>
          new IFunction({
            function: _.code,
            name: _.name,
          })
      )
    );

    return apiResponse(output);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @Post('/module/import')
  async import(@Req() req: AuthenticatedRequest, @Body() data: BuiltinModule<unknown>) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.seedModule(data));
  }
}
