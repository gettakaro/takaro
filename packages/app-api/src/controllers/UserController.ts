import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  UserCreateInputDTO,
  UserOutputDTO,
  UserService,
} from '../service/UserService';
import {
  AuthenticatedRequest,
  AuthService,
  LoginOutputDTO,
} from '../service/AuthService';
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
import { CAPABILITIES } from '../db/role';
import { DomainService } from '../service/DomainService';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';
import { Response } from 'express';

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

export class ParamIdAndRoleId extends ParamId {
  @IsUUID('4')
  roleId!: string;
}

class LoginOutputDTOAPI extends APIOutput<LoginOutputDTO> {
  @Type(() => LoginOutputDTO)
  @ValidateNested()
  data!: LoginOutputDTO;
}

class UserOutputDTOAPI extends APIOutput<UserOutputDTO> {
  @Type(() => UserOutputDTO)
  @ValidateNested()
  data!: UserOutputDTO;
}

class UserOutputArrayDTOAPI extends APIOutput<UserOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => UserOutputDTO)
  data!: UserOutputDTO[];
}

class UserSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

class UserSearchInputDTO extends ITakaroQuery<UserOutputDTO> {
  @ValidateNested()
  @Type(() => UserSearchInputAllowedFilters)
  filters!: UserSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class UserController {
  @Post('/login')
  @ResponseSchema(LoginOutputDTOAPI)
  async login(@Body() loginReq: LoginDTO, @Res() res: Response) {
    const domainId = await new DomainService().resolveDomain(loginReq.username);
    const service = new AuthService(domainId);
    return apiResponse(
      await service.login(loginReq.username, loginReq.password, res)
    );
  }

  @Post('/logout')
  @ResponseSchema(APIOutput)
  async logout(@Res() res: Response) {
    return apiResponse(await AuthService.logout(res));
  }

  @Get('/me')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(UserOutputDTOAPI)
  async me(@Req() req: AuthenticatedRequest) {
    const user = await new UserService(req.domainId).findOne(req.user.id);
    return apiResponse(user);
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @ResponseSchema(UserOutputArrayDTOAPI)
  @Post('/user/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Body() query: UserSearchInputDTO
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_USERS]))
  @ResponseSchema(UserOutputDTOAPI)
  @Get('/user/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_USERS]))
  @ResponseSchema(UserOutputDTOAPI)
  @Post('/user')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: UserCreateInputDTO
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.init(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_USERS]))
  @ResponseSchema(UserOutputDTOAPI)
  @Put('/user/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: UpdateUserDTO
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_USERS]))
  @ResponseSchema(APIOutput)
  @Delete('/user/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    const deletedDomain = await service.delete(params.id);
    return apiResponse(deletedDomain);
  }

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_USERS,
      CAPABILITIES.MANAGE_ROLES,
    ])
  )
  @Post('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.assignRole(params.id, params.roleId));
  }

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_USERS,
      CAPABILITIES.MANAGE_ROLES,
    ])
  )
  @Delete('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async removeRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.removeRole(params.id, params.roleId));
  }
}
