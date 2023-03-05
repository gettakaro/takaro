import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import {
  APIOutput,
  apiResponse,
  PaginatedRequest,
  PaginationMiddleware,
} from '@takaro/http';
import { PlayerOutputDTO, PlayerService } from '../service/PlayerService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import {
  Body,
  Get,
  Post,
  JsonController,
  UseBefore,
  Req,
  Params,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { CAPABILITIES } from '../service/RoleService.js';

export class PlayerOutputDTOAPI extends APIOutput<PlayerOutputDTO> {
  @Type(() => PlayerOutputDTO)
  @ValidateNested()
  declare data: PlayerOutputDTO;
}

export class PlayerOutputArrayDTOAPI extends APIOutput<PlayerOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerOutputDTO)
  declare data: PlayerOutputDTO[];
}

class PlayerSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  steamId!: string;

  @IsOptional()
  @IsString()
  epicOnlineServicesId!: string;

  @IsOptional()
  @IsString()
  xboxLiveId!: string;
}

class PlayerSearchInputDTO extends ITakaroQuery<PlayerSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => PlayerSearchInputAllowedFilters)
  declare filters: PlayerSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class PlayerController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_PLAYERS]))
  @UseBefore(PaginationMiddleware)
  @ResponseSchema(PlayerOutputArrayDTOAPI)
  @Post('/player/search')
  async search(
    @Req() req: AuthenticatedRequest & PaginatedRequest,
    @Body() query: PlayerSearchInputDTO
  ) {
    const service = new PlayerService(req.domainId);
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_PLAYERS]))
  @ResponseSchema(PlayerOutputDTOAPI)
  @Get('/player/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new PlayerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }
}
