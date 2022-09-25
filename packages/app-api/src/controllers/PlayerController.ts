import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { PlayerOutputDTO, PlayerService } from '../service/PlayerService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
import {
  Body,
  Get,
  Post,
  JsonController,
  UseBefore,
  Req,
  Params,
} from 'routing-controllers';
import { CAPABILITIES } from '../db/role';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';

export class PlayerOutputDTOAPI extends APIOutput<PlayerOutputDTO> {
  @Type(() => PlayerOutputDTO)
  @ValidateNested()
  data!: PlayerOutputDTO;
}

export class PlayerOutputArrayDTOAPI extends APIOutput<PlayerOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerOutputDTO)
  data!: PlayerOutputDTO[];
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
  filters!: PlayerSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class PlayerController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_PLAYERS]))
  @ResponseSchema(PlayerOutputArrayDTOAPI)
  @Post('/player/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Body() query: PlayerSearchInputDTO
  ) {
    const service = new PlayerService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_PLAYERS]))
  @ResponseSchema(PlayerOutputDTOAPI)
  @Get('/player/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new PlayerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }
}
