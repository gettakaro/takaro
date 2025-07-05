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
  PlayerInventoryOutputDTO,
  PlayerInventoryHistoryInputDTO,
  PlayersByItemInputDTO,
  PlayerItemHistoryOutputDTO,
} from '../service/Tracking/dto.js';

class PlayerLocationArrayOutputDTOAPI extends APIOutput<PlayerLocationOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerLocationOutputDTO)
  declare data: PlayerLocationOutputDTO[];
}

class PlayerInventoryArrayOutputDTOAPI extends APIOutput<PlayerInventoryOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerInventoryOutputDTO)
  declare data: PlayerInventoryOutputDTO[];
}

class PlayerItemHistoryArrayOutputDTOAPI extends APIOutput<PlayerItemHistoryOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerItemHistoryOutputDTO)
  declare data: PlayerItemHistoryOutputDTO[];
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
  @Post('/location')
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
  @Post('/location/box')
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
  @Post('/location/radius')
  async getRadiusPlayers(@Req() req: AuthenticatedRequest, @Body() data: RadiusSearchInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getRadiusPlayers(data);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerInventoryArrayOutputDTOAPI)
  @OpenAPI({
    description: 'Get inventory changes for a player between two timestamps',
  })
  @Post('/inventory/player')
  async getPlayerInventoryHistory(@Req() req: AuthenticatedRequest, @Body() data: PlayerInventoryHistoryInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getPlayerInventoryHistory(data);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerItemHistoryArrayOutputDTOAPI)
  @OpenAPI({
    description: 'Find all players who have had a specific item in their inventory',
  })
  @Post('/inventory/item')
  async getPlayersByItem(@Req() req: AuthenticatedRequest, @Body() data: PlayersByItemInputDTO) {
    const service = new TrackingService(req.domainId);
    const result = await service.getPlayersByItem(data);
    return apiResponse(result);
  }
}
