import { ITakaroQuery } from '@takaro/db';
import { apiResponse } from '@takaro/http';
import {
  CreateRoleDTO,
  GetRoleDTO,
  RoleService,
  UpdateRoleDTO,
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
  Params,
} from 'routing-controllers';
import { ParamId } from '../lib/validators';
import { CAPABILITIES } from '../db/role';

@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role')
  async getAll(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: ITakaroQuery<GetRoleDTO>
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.findOne(id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Post('/role')
  async post(@Req() req: AuthenticatedRequest, @Body() data: CreateRoleDTO) {
    const service = new RoleService(req.domainId);
    return apiResponse(
      await service.createWithCapabilities(data.name, data.capabilities)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Put('/role/:id')
  async put(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateRoleDTO
  ) {
    const service = new RoleService(req.domainId);
    await service.setCapabilities(id, data.capabilities);
    return apiResponse(await service.update(id, { name: data.name }));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() { id }: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(id);
    return apiResponse();
  }
}
