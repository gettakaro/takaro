import { IsDateString, IsISO8601, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Get, JsonController, UseBefore, Req, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { StatsOutputDTO, StatsService } from '../service/StatsService.js';
import { TakaroDTO } from '@takaro/util';

class StatsOutputDTOAPI extends APIOutput<StatsOutputDTO> {
  @ValidateNested()
  @Type(() => StatsOutputDTO)
  declare data: StatsOutputDTO;
}

class BaseStatsInputDTO extends TakaroDTO<BaseStatsInputDTO> {
  @IsISO8601()
  @IsDateString()
  @IsOptional()
  startDate?: string;
  @IsOptional()
  @IsDateString()
  @IsISO8601()
  endDate?: string;
}

class PogStatsInputDTO extends BaseStatsInputDTO {
  @IsUUID('4')
  gameServerId!: string;
  @IsUUID('4')
  playerId!: string;
}

class PlayersOnlineInputDTO extends BaseStatsInputDTO {
  @IsOptional()
  @IsUUID('4')
  gameServerId?: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class StatsController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS, PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/ping')
  async getPingStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PogStatsInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getPing(query.playerId, query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS, PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/currency')
  async getCurrencyStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PogStatsInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getCurrency(query.playerId, query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS, PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/players-online')
  async getPlayerOnlineStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PlayersOnlineInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getPlayersOnline(query.gameServerId, query.startDate, query.endDate));
  }
}
