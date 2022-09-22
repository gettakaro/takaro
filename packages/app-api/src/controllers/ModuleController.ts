import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  ModuleCreateDTO,
  ModuleOutputDTO,
  ModuleService,
  UpdateModuleDTO,
} from '../service/ModuleService';
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
import { CAPABILITIES } from '../db/role';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';

export class ModuleOutputDTOAPI extends APIOutput<ModuleOutputDTO> {
  @Type(() => ModuleOutputDTO)
  @ValidateNested()
  data!: ModuleOutputDTO;
}

export class ModuleOutputArrayDTOAPI extends APIOutput<ModuleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ModuleOutputDTO)
  data!: ModuleOutputDTO[];
}

class ModuleSearchInputAllowedFilters {
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

class ModuleSearchInputDTO extends ITakaroQuery<ModuleSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  filters!: ModuleSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class ModuleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_MODULES]))
  @ResponseSchema(ModuleOutputArrayDTOAPI)
  @Post('/module/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Body() query: ModuleSearchInputDTO
  ) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @Get('/module/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @Post('/module')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: ModuleCreateDTO
  ) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @Put('/module/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: UpdateModuleDTO
  ) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_MODULES]))
  @ResponseSchema(APIOutput)
  @Delete('/module/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const deletedRecord = await service.delete(params.id);
    return apiResponse(deletedRecord);
  }
}
