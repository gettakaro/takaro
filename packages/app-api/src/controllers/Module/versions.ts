import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ModuleService } from '../../service/Module/index.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { errors } from '@takaro/util';
import { builtinModuleModificationMiddleware } from '../../middlewares/builtinModuleModification.js';
import { BuiltinModule, ICommand, ICommandArgument, ICronJob, IFunction, IHook } from '@takaro/modules';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import { ModuleExportInputDTO, ModuleVersionCreateAPIDTO, ModuleVersionOutputDTO, ModuleVersionUpdateDTO } from '../../service/Module/dto.js';
import { PermissionCreateDTO } from '../../service/RoleService.js';


export class ModuleVersionOutputDTOAPI extends APIOutput<ModuleVersionOutputDTO> {
  @Type(() => ModuleVersionOutputDTO)
  @ValidateNested()
  declare data: ModuleVersionOutputDTO;
}

export class ModuleVersionOutputArrayDTOAPI extends APIOutput<ModuleVersionOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ModuleVersionOutputDTO)
  declare data: ModuleVersionOutputDTO[];
}

class ModuleVersionSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  version: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  moduleId: string[];
}


class ModuleVersionSearchInputDTO extends ITakaroQuery<ModuleVersionSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleVersionSearchInputAllowedFilters)
  declare filters: ModuleVersionSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => ModuleVersionSearchInputAllowedFilters)
  declare search: ModuleVersionSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;
}


class ModuleExportDTOAPI extends APIOutput<BuiltinModule<unknown>> {
  @Type(() => BuiltinModule)
  @ValidateNested()
  declare data: BuiltinModule<unknown>;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
  tags: ['Module'],
})
@JsonController('/module/version')
export class ModuleVersionController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleVersionOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search module versions',
  })
  @Post('/search')
  async searchVersions(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ModuleVersionSearchInputDTO) {
    const service = new ModuleService(req.domainId);
    const result = await service.findVersions({
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
  @ResponseSchema(ModuleVersionOutputDTOAPI)
  @OpenAPI({
    summary: 'Get one version',
  })
  @Get('/:id')
  async getModuleVersion(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const res = await service.findOneVersion(params.id);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(ModuleVersionOutputDTOAPI)
  @OpenAPI({
    summary: 'Update a version',
    description: 'Update a version of a module, note that you can only update the "latest" version. Tagged versions are immutable',
  })
  @Put('/:id')
  async updateVersion(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ModuleVersionUpdateDTO) {
    const service = new ModuleService(req.domainId);
    const result = await service.updateVersion(params.id, data);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(APIOutput)
  @OpenAPI({
    summary: 'Remove a version',
    description: 'Removes a version of a module, including all config that is linked to this version',
  })
  @Delete('/:id')
  async removeVersion(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    await service.deleteVersion(params.id);
    return apiResponse();
  }


  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @ResponseSchema(ModuleVersionOutputDTOAPI)
  @OpenAPI({
    summary: 'Tag a new version',
    description: 'Creates a new version of a module, copying all config (commands,hooks,cronjobs,...) from the "latest" version into a new, immutable version',
  })
  @Post('/')
  async tagVersion(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ModuleVersionCreateAPIDTO) {
    const service = new ModuleService(req.domainId);
    const result = await service.tagVersion(params.id, data.tag);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @OpenAPI({
    summary: 'Export a module version',
    description: 'Exports a module to a format that can be imported into another Takaro instance',
  })
  @Post('/export')
  @ResponseSchema(ModuleExportDTOAPI)
  async export(@Req() req: AuthenticatedRequest, @Body() data: ModuleExportInputDTO) {
    const service = new ModuleService(req.domainId);
    const version = await service.findOneVersion(data.versionId);
    if (!version) throw new errors.NotFoundError('Version not found');
    const mod = await service.findOne(version.moduleId);
    if (!mod) throw new errors.NotFoundError('Module not found');
    if (!version) throw new errors.NotFoundError('Version not found');

    const output = new BuiltinModule(mod.name, version.description, version.tag, version.configSchema, version.uiSchema);
    output.commands = await Promise.all(
      version.commands.map(
        (_) =>
          new ICommand({
            function: _.function.code,
            name: _.name,
            trigger: _.trigger,
            helpText: _.helpText,
            arguments: _.arguments.map(
              (arg) =>
                new ICommandArgument({
                  name: arg.name,
                  type: arg.type,
                  defaultValue: arg.defaultValue,
                  helpText: arg.helpText,
                  position: arg.position,
                }),
            ),
          }),
      ),
    );

    output.hooks = await Promise.all(
      version.hooks.map(
        (_) =>
          new IHook({
            function: _.function.code,
            name: _.name,
            eventType: _.eventType,
          }),
      ),
    );

    output.cronJobs = await Promise.all(
      version.cronJobs.map(
        (_) =>
          new ICronJob({
            function: _.function.code,
            name: _.name,
            temporalValue: _.temporalValue,
          }),
      ),
    );

    output.functions = await Promise.all(
      version.functions.map(
        (_) =>
          new IFunction({
            function: _.code,
            name: _.name,
          }),
      ),
    );

    output.permissions = await Promise.all(
      version.permissions.map(
        (_) =>
          new PermissionCreateDTO({
            canHaveCount: _.canHaveCount,
            description: _.description,
            permission: _.permission,
            friendlyName: _.friendlyName,
          }),
      ),
    );

    return apiResponse(output);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @OpenAPI({
    summary: 'Import a module version',
    description: 'Imports a module from a format that was exported from another Takaro instance',
  })
  @Post('/import')
  async import(@Req() req: AuthenticatedRequest, @Body() data: BuiltinModule<unknown>) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.import(data));
  }

}