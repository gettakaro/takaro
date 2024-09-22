import { IsDateString, IsEnum, IsISO8601, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Get, JsonController, UseBefore, Req, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { StatsOutputDTO, StatsService } from '../service/StatsService.js';
import { TakaroDTO } from '@takaro/util';
import { EVENT_TYPES } from '../service/EventService.js';

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

class LatencyInputDTO extends BaseStatsInputDTO {
  @IsUUID('4')
  gameServerId: string;
}

class ActivityInputDTO extends BaseStatsInputDTO {
  @IsOptional()
  @IsUUID('4')
  gameServerId!: string;

  @IsEnum(['daily', 'weekly', 'monthly'])
  timeType: 'daily' | 'weekly' | 'monthly';

  @IsEnum(['users', 'players'])
  dataType: 'users' | 'players';
}

export class EventsCountInputDTO extends BaseStatsInputDTO {
  @IsEnum(Object.values(EVENT_TYPES))
  eventName: string;
  @IsEnum(['player', 'module', 'user', 'gameserver'], { each: true })
  @IsOptional()
  sumBy?: string[];
  @IsOptional()
  @IsString()
  gameServerId: string;
  @IsOptional()
  @IsString()
  moduleId: string;
  @IsOptional()
  @IsString()
  playerId: string;
  @IsOptional()
  @IsString()
  userId: string;
  @IsEnum(['5m', '30m', '1h', '6h', '12h', '24h'])
  bucketStep: string;
}

export class CountryStatsInputDTO extends TakaroDTO<CountryStatsInputDTO> {
  @IsOptional()
  @IsString({ each: true })
  gameServerId: string[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class StatsController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/ping')
  async getPingStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PogStatsInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getPing(query.playerId, query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/currency')
  async getCurrencyStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PogStatsInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getCurrency(query.playerId, query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(StatsOutputDTOAPI)
  @OpenAPI({
    description: 'The roundtrip time for reachability tests between Takaro and the game server',
  })
  @Get('/stats/latency')
  async getLatencyStats(@Req() req: AuthenticatedRequest, @QueryParams() query: LatencyInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getLatency(query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/players-online')
  async getPlayerOnlineStats(@Req() req: AuthenticatedRequest, @QueryParams() query: PlayersOnlineInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getPlayersOnline(query.gameServerId, query.startDate, query.endDate));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @Get('/stats/activity')
  async getActivityStats(@Req() req: AuthenticatedRequest, @QueryParams() query: ActivityInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(
      await service.getActivityStats(
        query.dataType,
        query.timeType,
        query.gameServerId,
        query.startDate,
        query.endDate,
      ),
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @OpenAPI({
    summary: 'Get event count over time',
    description:
      'Calculates how many times an event type has occured over `bucketStep` time. Supports different filters and can return multiple series at a time.',
  })
  @Get('/stats/events-count')
  async getEventsCount(@Req() req: AuthenticatedRequest, @QueryParams() query: EventsCountInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getEventsCountOverTime(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(StatsOutputDTOAPI)
  @OpenAPI({
    summary: 'Get statistics about the countries of the players',
  })
  @Get('/stats/countries')
  async getCountryStats(@Req() req: AuthenticatedRequest, @QueryParams() query: CountryStatsInputDTO) {
    const service = new StatsService(req.domainId);
    return apiResponse(await service.getCountryStats(query));
  }
}
