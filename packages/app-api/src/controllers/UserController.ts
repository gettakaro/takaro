import {
  IsBoolean,
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { UserCreateInputDTO, UserOutputDTO, UserOutputWithRolesDTO, UserUpdateDTO } from '../service/User/dto.js';
import { UserService } from '../service/User/index.js';
import { AuthenticatedRequest, AuthService, checkPermissions, LoginOutputDTO } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res, Param } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId, ParamIdAndRoleId } from '../lib/validators.js';
import { Request, Response } from 'express';
import { PERMISSIONS } from '@takaro/auth';
import { AllowedFilters, AllowedSearch, RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { DomainOutputDTO, DomainService } from '../service/DomainService.js';
import { TakaroDTO } from '@takaro/util';
import { config } from '../config.js';
import { PlayerService } from '../service/Player/index.js';
import { PlayerOnGameserverOutputDTO } from '../service/PlayerOnGameserverService.js';
import { PlayerOutputWithRolesDTO } from '../service/Player/dto.js';
import { SettingsService, SETTINGS_KEYS } from '../service/SettingsService.js';

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

export class InviteCreateDTO {
  @IsString()
  @IsEmail()
  email!: string;
}

class UserRoleAssignChangeDTO {
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

class LoginOutputDTOAPI extends APIOutput<LoginOutputDTO> {
  @Type(() => LoginOutputDTO)
  @ValidateNested()
  declare data: LoginOutputDTO;
}

class MeOutputDTO extends TakaroDTO<MeOutputDTO> {
  @Type(() => UserOutputWithRolesDTO)
  @ValidateNested()
  user: UserOutputWithRolesDTO;
  @Type(() => DomainOutputDTO)
  @ValidateNested({ each: true })
  domains: DomainOutputDTO[];
  @IsString()
  domain: string;
  @Type(() => PlayerOutputWithRolesDTO)
  @ValidateNested()
  @IsOptional()
  player?: PlayerOutputWithRolesDTO;
  @Type(() => PlayerOnGameserverOutputDTO)
  @ValidateNested({ each: true })
  pogs: PlayerOnGameserverOutputDTO[];
}

class MeOutoutDTOAPI extends APIOutput<MeOutputDTO> {
  @Type(() => MeOutputDTO)
  @ValidateNested()
  declare data: MeOutputDTO;
}

class UserOutputDTOAPI extends APIOutput<UserOutputWithRolesDTO> {
  @Type(() => UserOutputWithRolesDTO)
  @ValidateNested()
  declare data: UserOutputWithRolesDTO;
}

class UserOutputArrayDTOAPI extends APIOutput<UserOutputWithRolesDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => UserOutputWithRolesDTO)
  declare data: UserOutputWithRolesDTO[];
}

class UserSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name?: string[] | undefined;
  @IsOptional()
  @IsString({ each: true })
  idpId?: string[] | undefined;
  @IsOptional()
  @IsString({ each: true })
  discordId?: string[] | undefined;
  @IsOptional()
  @IsUUID(4, { each: true })
  playerId?: string[] | undefined;
  @IsOptional()
  @IsUUID(4, { each: true })
  roleId?: string[] | undefined;
  @IsOptional()
  @IsBoolean({ each: true })
  isDashboardUser?: boolean[];
}

class UserSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name?: string[] | undefined;
  @IsOptional()
  @IsString({ each: true })
  discordId?: string[] | undefined;
}

class UserSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  lastSeen?: string | undefined;
}

const userExtendOptions = ['roles'];
type UserExtendOptions = (typeof userExtendOptions)[number];

export class UserSearchInputDTO extends ITakaroQuery<UserOutputDTO> {
  @ValidateNested()
  @Type(() => UserSearchInputAllowedFilters)
  declare filters: UserSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedSearch)
  declare search: UserSearchInputAllowedSearch;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedRangeFilter)
  declare greaterThan: UserSearchInputAllowedRangeFilter;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedRangeFilter)
  declare lessThan: Partial<UserSearchInputAllowedRangeFilter>;

  @IsOptional()
  @IsEnum(userExtendOptions, { each: true })
  declare extend?: UserExtendOptions[];
}

class LinkPlayerUnauthedInputDTO extends TakaroDTO<LinkPlayerUnauthedInputDTO> {
  @IsEmail()
  email: string;
  @IsString()
  code: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class UserController {
  @Post('/login')
  @ResponseSchema(LoginOutputDTOAPI)
  async login(@Body() loginReq: LoginDTO) {
    return apiResponse(await AuthService.login(loginReq.username, loginReq.password));
  }

  @Post('/logout')
  @ResponseSchema(APIOutput)
  async logout(@Req() req: Request) {
    return apiResponse(await AuthService.logout(req));
  }

  @Get('/me')
  @UseBefore(AuthService.getAuthMiddleware([], false))
  @ResponseSchema(MeOutoutDTOAPI)
  @OpenAPI({
    summary: 'Get the current logged in user',
    description:
      'Get the current user and the domains that the user has access to. Note that you can only make requests in the scope of a single domain. In order to switch the domain, you need to use the domain selection endpoints',
  })
  async me(@Req() req: AuthenticatedRequest) {
    const user = await new UserService(req.domainId).findOne(req.user.id);
    const domainService = new DomainService();
    let domains = await domainService.resolveDomainByIdpId(user.idpId);

    const hasManageServersPermission = checkPermissions([PERMISSIONS.MANAGE_GAMESERVERS], user);

    if (!hasManageServersPermission) {
      domains = domains.map((d) => {
        delete d.serverRegistrationToken;
        return d;
      });
    }

    // Apply custom domain names from settings
    domains = await Promise.all(
      domains.map(async (domain) => {
        try {
          const settingsService = new SettingsService(domain.id);
          const domainNameSetting = await settingsService.get(SETTINGS_KEYS.domainName);

          if (domainNameSetting.value && domainNameSetting.value.trim() !== '') {
            domain.name = domainNameSetting.value;
          }
        } catch {
          // If settings lookup fails, continue with original domain name
        }
        return domain;
      }),
    );

    const response = new MeOutputDTO({ user, domains, domain: req.domainId, pogs: [] });

    if (user.playerId) {
      const playerService = await new PlayerService(req.domainId);
      const { player, pogs } = await playerService.resolveFromId(user.playerId);
      response.player = player;
      response.pogs = pogs;
    }

    return apiResponse(response);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_USERS], false))
  @ResponseSchema(UserOutputArrayDTOAPI)
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          examples: {
            membersOfRole: {
              summary: 'Get all users with a specific role',
              value: { filters: { roleId: ['1ec529af-0f8f-4d8d-b06a-7f83c64f0086'] } },
            },
          },
        },
      },
    },
  })
  @Post('/user/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: UserSearchInputDTO) {
    const service = new UserService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Get('/user/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Post('/user')
  async create(@Req() req: AuthenticatedRequest, @Body() data: UserCreateInputDTO) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Put('/user/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: UserUpdateDTO) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(APIOutput)
  @Delete('/user/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES], false))
  @Post('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId,
    @Body() data: UserRoleAssignChangeDTO,
  ) {
    const service = new UserService(req.domainId);
    await service.assignRole(params.roleId, params.id, data.expiresAt);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES], false))
  @Delete('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async removeRole(@Req() req: AuthenticatedRequest, @Params() params: ParamIdAndRoleId) {
    const service = new UserService(req.domainId);
    await service.removeRole(params.roleId, params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @Post('/user/invite')
  @ResponseSchema(UserOutputDTOAPI)
  async invite(@Req() req: AuthenticatedRequest, @Body() data: InviteCreateDTO) {
    const service = new UserService(req.domainId);
    const user = await service.inviteUser(data.email);
    return apiResponse(user);
  }

  @UseBefore(AuthService.getAuthMiddleware([], false))
  @Post('/selected-domain/:domainId')
  @OpenAPI({
    summary: 'Set the selected domain for the user',
    description:
      'One user can have multiple domains, this endpoint is a helper to set the selected domain for the user',
  })
  setSelectedDomain(@Req() req: AuthenticatedRequest, @Param('domainId') domainId: string) {
    req.res?.cookie('takaro-domain', domainId, {
      sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
      secure: config.get('http.domainCookie.secure'),
      domain: config.get('http.domainCookie.domain'),
    });

    return apiResponse();
  }

  @Delete('/selected-domain')
  @OpenAPI({
    summary: 'Unset the selected domain for the user',
    description:
      'Unset the selected domain for the user, this will clear the domain cookie. On the next request, the backend will set this again.',
  })
  deleteSelectedDomainCookie(@Req() req: AuthenticatedRequest) {
    req.res?.clearCookie('takaro-domain', {
      sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
      secure: config.get('http.domainCookie.secure'),
      domain: config.get('http.domainCookie.domain'),
    });

    return apiResponse();
  }

  @Post('/user/player')
  @OpenAPI({
    summary: 'Link player profile',
    description:
      'Link your player profile to Takaro, allowing web access for things like shop and stats. To get the code, use the /link command in the game.',
  })
  async linkPlayerProfile(@Req() req: AuthenticatedRequest, @Body() data: LinkPlayerUnauthedInputDTO) {
    const userService = new UserService('dummy-domain-id');
    const { user, domainId } = await userService.NOT_DOMAIN_SCOPED_linkPlayerProfile(req, data.email, data.code);
    req.res?.cookie('takaro-domain', domainId, {
      sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
      secure: config.get('http.domainCookie.secure'),
      domain: config.get('http.domainCookie.domain'),
    });
    return apiResponse(user);
  }
}
