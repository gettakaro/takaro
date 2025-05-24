import { ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { TrackingService } from '../service/Tracking/index.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Post, JsonController, UseBefore, Req } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import {
  PlayerLocationOutputDTO,
  PlayerMovementHistoryInputDTO,
  BoundingBoxSearchInputDTO,
  RadiusSearchInputDTO,
} from '../service/Tracking/dto.js';

class PlayerLocationArrayOutputDTOAPI extends APIOutput<PlayerLocationOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerLocationOutputDTO)
  declare data: PlayerLocationOutputDTO[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController('/tracking')
export class TrackingController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerLocationArrayOutputDTOAPI)
  @OpenAPI({
    description: 'Get movement history for players within date bounds',
  })
  @Post('/gameserver/tracking/location')
  async getPlayerMovementHistory(@Req() req: AuthenticatedRequest, @Body() data: PlayerMovementHistoryInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getPlayerMovementHistory(data);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerLocationArrayOutputDTOAPI)
  @OpenAPI({
    description: 'Find all players within a 3D rectangular volume at a specific time',
  })
  @Post('/gameserver/tracking/location/box')
  async getBoundingBoxPlayers(@Req() req: AuthenticatedRequest, @Body() data: BoundingBoxSearchInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getBoundingBoxPlayers(data);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerLocationArrayOutputDTOAPI)
  @OpenAPI({
    description: 'Find all players within a spherical area from a center point',
  })
  @Post('/gameserver/tracking/location/radius')
  async getRadiusPlayers(@Req() req: AuthenticatedRequest, @Body() data: RadiusSearchInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getRadiusPlayers(data);
    return apiResponse(result);
  }
}
