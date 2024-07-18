import { IsDefined, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { errors, TakaroDTO } from '@takaro/util';
import { Settings, SettingsService, SETTINGS_KEYS, SettingsOutputDTO } from '../service/SettingsService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, QueryParams, Delete } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';

class GetSettingsOneInput extends TakaroDTO<GetSettingsOneInput> {
  @IsString()
  @IsOptional()
  @IsUUID()
  gameServerId?: string;
}

export class GetSettingsInput extends TakaroDTO<GetSettingsInput> {
  @IsOptional()
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(SETTINGS_KEYS, {
    each: true,
    message: `key must be one of: ${Object.values(SETTINGS_KEYS).join(', ')}`,
  })
  keys!: Array<SETTINGS_KEYS>;

  @IsString()
  @IsOptional()
  @IsUUID()
  gameServerId?: string;
}

export class SettingsOutputDTOAPI extends APIOutput<SettingsOutputDTO> {
  @ValidateNested()
  @Type(() => SettingsOutputDTO)
  declare data: SettingsOutputDTO;
}

export class SettingsOutputArrayDTOAPI extends APIOutput<SettingsOutputDTO[]> {
  @Type(() => SettingsOutputDTO)
  @ValidateNested({ each: true })
  declare data: SettingsOutputDTO[];
}

class ParamKey {
  @IsString()
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(SETTINGS_KEYS, {
    message: `key must be one of: ${Object.values(SETTINGS_KEYS).join(', ')}`,
  })
  key!: SETTINGS_KEYS;
}

class SettingsSetDTO {
  @IsString()
  @IsOptional()
  @IsUUID()
  gameServerId?: string;

  @IsDefined()
  value!: Settings[SETTINGS_KEYS];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class SettingsController {
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(SettingsOutputDTOAPI)
  @Get('/settings/:key')
  async getOne(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: GetSettingsOneInput,
    @Params() params: ParamKey
  ) {
    if (!params.key || !Object.values(SETTINGS_KEYS).includes(params.key)) {
      throw new errors.NotFoundError();
    }

    const service = new SettingsService(req.domainId, query.gameServerId);
    return apiResponse(await service.get(params.key));
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(SettingsOutputArrayDTOAPI)
  @Get('/settings')
  async get(@Req() req: AuthenticatedRequest, @QueryParams() query: GetSettingsInput) {
    const service = new SettingsService(req.domainId, query.gameServerId);

    if (query.keys) {
      // if only one value is passed in, the type will be a string. convert to an array for consistency in handling.
      // See: https://github.com/typestack/routing-controllers/issues/389
      const keys: SETTINGS_KEYS[] = Array.isArray(query.keys) ? query.keys : [query.keys] || undefined;
      return apiResponse(await service.getMany(keys));
    } else {
      return apiResponse(await service.getAll());
    }
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SETTINGS]))
  @ResponseSchema(SettingsOutputDTOAPI)
  @Post('/settings/:key')
  async set(@Req() req: AuthenticatedRequest, @Body() body: SettingsSetDTO, @Params() params: ParamKey) {
    const service = new SettingsService(req.domainId, body.gameServerId);
    return apiResponse(await service.set(params.key, body.value));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SETTINGS]))
  @ResponseSchema(SettingsOutputArrayDTOAPI)
  @Delete('/settings/:key')
  async delete(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: GetSettingsOneInput,
    @Params() params: ParamKey
  ) {
    const service = new SettingsService(req.domainId, query.gameServerId);
    await service.set(params.key, null);
    return apiResponse(service.getAll());
  }
}
