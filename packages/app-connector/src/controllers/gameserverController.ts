import { apiResponse } from '@takaro/http';
import { IsEnum, IsJSON, IsString } from 'class-validator';
import { JsonController, Params, Post, Body } from 'routing-controllers';
import { TakaroDTO } from '@takaro/util';
import { wsServer } from '../lib/websocket.js';
import { GAME_SERVER_ACTIONS, GameServerActions } from '@takaro/gameserver';

class IdParam {
  @IsString()
  id: string;
}

class RequestInputDTO extends TakaroDTO<RequestInputDTO> {
  @IsEnum(GAME_SERVER_ACTIONS)
  operation: GameServerActions;
  @IsJSON()
  data: string;
}

@JsonController('/gameserver')
export class GameServerController {
  @Post('/:id/request')
  async requestFromServer(@Params() params: IdParam, @Body() body: RequestInputDTO) {
    const result = await wsServer.requestFromGameServer(params.id, body.operation, body.data);
    return apiResponse(result);
  }

  @Post('/:id/reset')
  async resetServerConnection(@Params() params: IdParam) {
    const result = await wsServer.resetConnection(params.id);
    return apiResponse(result);
  }
}
