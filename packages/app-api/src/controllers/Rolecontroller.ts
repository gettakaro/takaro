import {
  ArrayMinSize,
  IsArray,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { apiResponse } from '@takaro/http';
import { RoleService } from '../service/RoleService';
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
import { CAPABILITIES } from '@prisma/client';
import { ParamId } from '../lib/validators';

@ValidatorConstraint()
export class IsCapabilityArray implements ValidatorConstraintInterface {
  public async validate(capabilities: CAPABILITIES[]) {
    return (
      Array.isArray(capabilities) &&
      capabilities.every((capability) =>
        Object.values(CAPABILITIES).includes(capability)
      )
    );
  }
}

export class CreateRoleDTO {
  @Length(3, 20)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @Validate(IsCapabilityArray, { message: 'Invalid capabilities' })
  capabilities!: CAPABILITIES[];
}

export class UpdateRoleDTO {
  @Length(3, 20)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @Validate(IsCapabilityArray, { message: 'Invalid capabilities' })
  capabilities!: CAPABILITIES[];
}

export class GetRoleDTO {
  @Length(3, 20)
  name!: string;
}

@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role')
  async getAll(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: Partial<ITakaroQuery<GetRoleDTO>>
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.get(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.getOne(id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Post('/role')
  async post(@Req() req: AuthenticatedRequest, @Body() data: CreateRoleDTO) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Put('/role/:id')
  async put(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateRoleDTO
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.update(id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() { id }: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(id);
    return apiResponse();
  }
}
