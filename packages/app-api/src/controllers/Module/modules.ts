import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
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
  QueryParams,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { errors } from '@takaro/util';
import { moduleProtectionMiddleware } from '../../middlewares/moduleProtectionMiddleware.js';
import { AllowedFilters, AllowedSearch, PaginationParams, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import { ITakaroQuery } from '@takaro/db';
import { ModuleService } from '../../service/Module/index.js';
import {
  ModuleCreateAPIDTO,
  ModuleExportOptionsDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
  SmallModuleVersionOutputDTO,
} from '../../service/Module/dto.js';

import { ModuleTransferDTO, ICommand, ICommandArgument, ICronJob, IFunction, IHook } from '@takaro/modules';
import { PermissionCreateDTO } from '../../service/RoleService.js';
import { ModuleTransferVersionDTO } from '@takaro/modules';

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

export class SmallModuleOutputArrayDTOAPI extends APIOutput<SmallModuleVersionOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => SmallModuleVersionOutputDTO)
  declare data: SmallModuleVersionOutputDTO[];
}

class ModuleSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name: string[];
  @IsOptional()
  @IsString({ each: true })
  builtin: string[];
}

class ModuleSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name: string[];
}

class ModuleSearchInputDTO extends ITakaroQuery<ModuleSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  declare filters: ModuleSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedSearch)
  declare search: ModuleSearchInputAllowedSearch;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;
}

class ModuleExportDTOAPI extends APIOutput<ModuleTransferDTO<unknown>> {
  @Type(() => ModuleTransferDTO)
  @ValidateNested()
  declare data: ModuleTransferDTO<unknown>;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
  tags: ['Module'],
})
@JsonController('/module')
export class ModuleController {
  // #region CRUD
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search modules',
  })
  @Post('/search')
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
  @OpenAPI({
    summary: 'Get one module',
  })
  @Get('/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(SmallModuleOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Get tags',
    description: 'Get a list of all tags for a module, without including all the underlying data',
  })
  @Get('/:id/tags')
  async getTags(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Params() params: ParamId,
    @QueryParams() query: PaginationParams,
  ) {
    const service = new ModuleService(req.domainId);
    const result = await service.getTags(params.id, query);
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @OpenAPI({
    summary: 'Create module',
    description: 'Create a new module',
  })
  @Post('')
  async create(@Req() req: AuthenticatedRequest, @Body() data: ModuleCreateAPIDTO) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.init(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(ModuleOutputDTOAPI)
  @OpenAPI({
    summary: 'Update a module',
    description: 'Update a module',
  })
  @Put('/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ModuleUpdateDTO) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(APIOutput)
  @OpenAPI({
    summary: 'Remove a module',
    description: 'Removes a module, including all versions and config',
  })
  @Delete('/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    await service.delete(params.id);
    return apiResponse();
  }
  // #endregion CRUD
  // #region Export/Import

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @OpenAPI({
    summary: 'Export a module',
    description:
      'Exports a module to a format that can be imported into another Takaro instance. This endpoint will export all known versions of the module',
  })
  @Post('/:id/export')
  @ResponseSchema(ModuleExportDTOAPI)
  async export(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() options: ModuleExportOptionsDTO) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    const versions = await service.findVersions({ filters: { moduleId: [params.id] } });

    if (options.versionIds) {
      // If user specifies an empty list, we assume they want all versions
      if (options.versionIds?.length) {
        versions.results = versions.results.filter((_) => options.versionIds?.includes(_.id));
      }
    }

    const preparedVersions = await Promise.all(
      versions.results.map(
        async (version) =>
          new ModuleTransferVersionDTO({
            tag: version.tag,
            description: version.description,
            configSchema: version.configSchema,
            uiSchema: version.uiSchema,
            commands: await Promise.all(
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
            ),
            hooks: await Promise.all(
              version.hooks.map(
                (_) =>
                  new IHook({
                    function: _.function.code,
                    name: _.name,
                    eventType: _.eventType,
                  }),
              ),
            ),
            cronJobs: await Promise.all(
              version.cronJobs.map(
                (_) =>
                  new ICronJob({
                    function: _.function.code,
                    name: _.name,
                    temporalValue: _.temporalValue,
                  }),
              ),
            ),
            functions: await Promise.all(
              version.functions.map(
                (_) =>
                  new IFunction({
                    function: _.code,
                    name: _.name,
                  }),
              ),
            ),
            permissions: await Promise.all(
              version.permissions.map(
                (_) =>
                  new PermissionCreateDTO({
                    canHaveCount: _.canHaveCount,
                    description: _.description,
                    permission: _.permission,
                    friendlyName: _.friendlyName,
                  }),
              ),
            ),
          }),
      ),
    );

    const output = new ModuleTransferDTO({
      name: mod.name,
      versions: preparedVersions,
    });

    return apiResponse(output);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @OpenAPI({
    summary: 'Import a module',
    description: 'Imports a module from a format that was exported from another Takaro instance',
  })
  @Post('/import')
  async import(@Req() req: AuthenticatedRequest, @Body() _data: any) {
    // Bypass routing-controllers here, it always transforms the data to a class instance
    // We don't want this, as the service will do smarter business-logic checks later and validate.
    const data = req.body as ModuleTransferDTO<unknown>;
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.import(data));
  }
  // #endregion Export/Import
}
