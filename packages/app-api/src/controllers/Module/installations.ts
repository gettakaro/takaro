import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ModuleService } from '../../service/Module/index.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type, Exclude } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters } from '../shared.js';
import { InstallModuleDTO, ModuleInstallationOutputDTO } from '../../service/Module/dto.js';

class ModuleInstallationOutputDTOAPI extends APIOutput<ModuleInstallationOutputDTO> {
  @Type(() => ModuleInstallationOutputDTO)
  @ValidateNested()
  declare data: ModuleInstallationOutputDTO;
}

class ModuleInstallationOutputArrayDTOAPI extends APIOutput<ModuleInstallationOutputDTO[]> {
  @Type(() => ModuleInstallationOutputDTO)
  @ValidateNested({ each: true })
  declare data: ModuleInstallationOutputDTO[];
}

class ModuleInstallationSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID('4', { each: true })
  versionId: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  moduleId: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  gameserverId: string[];
}

class ModuleInstallationSearchInputDTO extends ITakaroQuery<ModuleInstallationSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleInstallationSearchInputAllowedFilters)
  declare filters: ModuleInstallationSearchInputAllowedFilters;

  @Exclude()
  declare extend?: string[];
}

class ModuleInstallParamId {
  @IsUUID('4')
  moduleId: string;
  @IsUUID('4')
  gameServerId: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
  tags: ['Module'],
})
@JsonController('/module')
export class ModuleInstallationsController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleInstallationOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search module installations',
  })
  @Post('/installation/search')
  async getInstalledModules(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: ModuleInstallationSearchInputDTO,
  ) {
    const service = new ModuleService(req.domainId);
    const result = await service.findInstallations({
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
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    summary: 'Get one installation',
  })
  @Get('/:moduleId/gameserver/:gameServerId/installation')
  async getModuleInstallation(@Req() req: AuthenticatedRequest, @Params() params: ModuleInstallParamId) {
    const service = new ModuleService(req.domainId);
    const res = await service.findOneInstallation(params.gameServerId, params.moduleId);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    description:
      'Install a module on a gameserver. You can have multiple installations of the same module on the same gameserver.',
  })
  @Post('/installation/')
  async installModule(@Req() req: AuthenticatedRequest, @Body() data: InstallModuleDTO) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.installModule(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    description: 'Uninstall a module from a gameserver. This will not delete the module from the database.',
  })
  @Delete('/:moduleId/gameserver/:gameServerId/installation')
  async uninstallModule(@Req() req: AuthenticatedRequest, @Params() params: ModuleInstallParamId) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.uninstallModule(params.gameServerId, params.moduleId));
  }
}
