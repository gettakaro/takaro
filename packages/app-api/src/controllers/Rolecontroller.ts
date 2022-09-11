import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  RoleCreateInputDTO,
  SearchRoleInputDTO,
  RoleService,
  RoleUpdateInputDTO,
  RoleOutputDTO,
} from '../service/RoleService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
import {
  Param,
  Body,
  Get,
  Post,
  Delete,
  JsonController,
  UseBefore,
  QueryParams,
  Req,
  Put,
} from 'routing-controllers';
import { CAPABILITIES } from '../db/role';
import { ResponseSchema } from 'routing-controllers-openapi';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RoleOutputDTOAPI extends APIOutput<RoleOutputDTO> {
  @Type(() => RoleOutputDTO)
  @ValidateNested()
  data!: RoleOutputDTO;
}

class RoleOutputArrayDTOAPI extends APIOutput<RoleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => RoleOutputDTO)
  data!: RoleOutputDTO[];
}

@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Post('/role/search')
  @ResponseSchema(RoleOutputArrayDTOAPI)
  async search(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: ITakaroQuery<SearchRoleInputDTO>
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role/:id')
  @ResponseSchema(RoleOutputDTOAPI)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.findOne(id));
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
      await service.createWithCapabilities(data.name, data.capabilities)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(RoleOutputDTOAPI)
  @Put('/role/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: RoleUpdateInputDTO
  ) {
    const service = new RoleService(req.domainId);
    await service.setCapabilities(id, data.capabilities);
    return apiResponse(await service.update(id, { name: data.name }));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(APIOutput)
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new RoleService(req.domainId);
    await service.delete(id);
    return apiResponse();
  }
}
