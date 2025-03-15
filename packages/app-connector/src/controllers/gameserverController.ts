import { apiResponse } from '@takaro/http';
import { IsEnum, IsJSON, IsString } from 'class-validator';
import { JsonController, Params, Post, Body } from 'routing-controllers';
import { TakaroDTO } from '@takaro/util';
import { wsServer } from '../lib/websocket.js';

class IdParam {
  @IsString()
  id: string;
}

class RequestInputDTO extends TakaroDTO<RequestInputDTO> {
  @IsEnum([
    'getPlayer',
    'getPlayers',
    'getPlayerLocation',
    'getPlayerInventory',
    'giveItem',
    'listItems',
    'executeConsoleCOmmand',
    'sendMessage',
    'teleportPlayer',
    'testReachability',
    'kickPlayer',
    'banPlayer',
    'unbanPlayer',
    'listBans',
    'shutdown',
    'getMapInfo',
    'getMapTile',
  ])
  operation: string;
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
}
