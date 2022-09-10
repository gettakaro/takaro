import { IsEmail, Length } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { apiResponse } from '@takaro/http';
import { UserService } from '../service/UserService';
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
import { DomainService } from '../service/DomainService';

export class CreateUserDTO {
  @Length(3, 50)
  name!: string;

  @IsEmail()
  email!: string;

  @Length(8, 50)
  password!: string;
}

export class UpdateUserDTO {
  @Length(3, 50)
  name!: string;
}

export class GetUserDTO {
  @Length(3, 50)
  name!: string;
}

export class LoginDTO {
  @Length(3, 50)
  username!: string;

  @Length(8, 50)
  password!: string;
}

@JsonController()
export class UserController {
  @Post('/login')
  async login(@Body() loginReq: LoginDTO) {
    const domainId = await new DomainService().resolveDomain(loginReq.username);
    const service = new AuthService(domainId);
    return apiResponse(
      await service.login(loginReq.username, loginReq.password)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @Get('/user')
  async getAll(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: ITakaroQuery<GetUserDTO>
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @Get('/user/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.findOne(id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @Post('/user')
  async post(@Req() req: AuthenticatedRequest, @Body() data: CreateUserDTO) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.init(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @Put('/user/:id')
  async put(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateUserDTO
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.update(id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @Delete('/user/:id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new UserService(req.domainId);
    const deletedDomain = await service.delete(id);
    return apiResponse(deletedDomain);
  }

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_USERS,
      CAPABILITIES.MANAGE_ROLES,
    ])
  )
  @Post('/user/:id/role/:roleId')
  async addRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('roleId') roleId: string
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.assignRole(id, roleId));
  }

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_USERS,
      CAPABILITIES.MANAGE_ROLES,
    ])
  )
  @Delete('/user/:id/role/:roleId')
  async removeRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('roleId') roleId: string
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.removeRole(id, roleId));
  }
}
