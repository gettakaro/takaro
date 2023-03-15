import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  RoleCreateInputDTO,
  SearchRoleInputDTO,
  RoleService,
  RoleUpdateInputDTO,
  RoleOutputDTO,
  CAPABILITIES,
} from '../service/RoleService.js';
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
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { Response } from 'express';

export class RoleOutputDTOAPI extends APIOutput<RoleOutputDTO> {
  @Type(() => RoleOutputDTO)
  @ValidateNested()
  declare data: RoleOutputDTO;
}

export class RoleOutputArrayDTOAPI extends APIOutput<RoleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => RoleOutputDTO)
  declare data: RoleOutputDTO[];
}

export class RoleSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

export class RoleSearchInputDTO extends ITakaroQuery<SearchRoleInputDTO> {
  @ValidateNested()
  @Type(() => RoleSearchInputAllowedFilters)
  declare filters: RoleSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Post('/role/search')
  @ResponseSchema(RoleOutputArrayDTOAPI)
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: RoleSearchInputDTO
  ) {
    const service = new RoleService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role/:id')
  @ResponseSchema(RoleOutputDTOAPI)
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Post('/role')
  @ResponseSchema(RoleOutputDTOAPI)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: RoleCreateInputDTO
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(
      await service.createWithCapabilities(data, data.capabilities)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(RoleOutputDTOAPI)
  @Put('/role/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: RoleUpdateInputDTO
  ) {
    const service = new RoleService(req.domainId);
    await service.setCapabilities(params.id, data.capabilities);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(APIOutput)
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
