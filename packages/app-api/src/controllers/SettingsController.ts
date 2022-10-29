import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { APIOutput, apiResponse, TakaroDTO } from '@takaro/http';
import { errors } from '@takaro/util';
import {
  Settings,
  SettingsService,
  SETTINGS_KEYS,
} from '../service/SettingsService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
import {
  Body,
  Get,
  Post,
  JsonController,
  UseBefore,
  Req,
  Params,
  QueryParams,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { CAPABILITIES } from '../service/RoleService';

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

export class SettingsOutputDTOAPI extends APIOutput<Settings[SETTINGS_KEYS]> {
  @IsString()
  data!: Settings[SETTINGS_KEYS];
}

export class SettingsOutputObjectDTOAPI extends APIOutput<
  Record<SETTINGS_KEYS, string>
> {
  @Type(() => Settings)
  @ValidateNested()
  data!: Record<SETTINGS_KEYS, string>;
}

class ParamKey {
  @IsString()
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(SETTINGS_KEYS, {
    each: true,
    message: `key must be one of: ${Object.values(SETTINGS_KEYS).join(', ')}`,
  })
  key!: SETTINGS_KEYS;
}

class SettingsSetDTO {
  @IsString()
  @IsOptional()
  @IsUUID()
  gameServerId?: string;

  @IsString()
  value!: Settings[SETTINGS_KEYS];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class SettingsController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_SETTINGS]))
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

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_SETTINGS]))
  @ResponseSchema(SettingsOutputObjectDTOAPI)
  @Get('/settings')
  async get(
    @Req() req: AuthenticatedRequest,
    @QueryParams() query: GetSettingsInput
  ) {
    const service = new SettingsService(req.domainId, query.gameServerId);

    if (query.keys) {
      // if only one value is passed in, the type will be a string. convert to an array for consistency in handling.
      // See: https://github.com/typestack/routing-controllers/issues/389
      const keys: SETTINGS_KEYS[] = Array.isArray(query.keys)
        ? query.keys
        : [query.keys] || undefined;
      return apiResponse(await service.getMany(keys));
    } else {
      return apiResponse(await service.getAll());
    }
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_SETTINGS]))
  @ResponseSchema(SettingsOutputDTOAPI)
  @Post('/settings/:key')
  async set(
    @Req() req: AuthenticatedRequest,
    @Body() body: SettingsSetDTO,
    @Params() params: ParamKey
  ) {
    const service = new SettingsService(req.domainId, body.gameServerId);
    return apiResponse(await service.set(params.key, body.value));
  }
}
