import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerService,
  UpdateGameServerDTO,
} from '../service/GameServerService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
import {
  Param,
  Body,
  Get,
  Post,
  Delete,
  JsonController,
  UseBefore,
  Req,
  Put,
} from 'routing-controllers';
import { CAPABILITIES } from '../db/role';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';

class GameServerOutputDTOAPI extends APIOutput<GameServerOutputDTO> {
  @Type(() => GameServerOutputDTO)
  @ValidateNested()
  data!: GameServerOutputDTO;
}

class UserOutputArrayDTOAPI extends APIOutput<GameServerOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => GameServerOutputDTO)
  data!: GameServerOutputDTO[];
}

class GameServerSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

class GameServerSearchInputDTO extends ITakaroQuery<GameServerOutputDTO> {
  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedFilters)
  filters!: GameServerSearchInputAllowedFilters;
}

@JsonController()
export class GameServerController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_GAMESERVERS]))
  @ResponseSchema(UserOutputArrayDTOAPI)
  @Post('/gameserver/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Body() query: GameServerSearchInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.find(query));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Get('/gameserver/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.findOne(id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Post('/gameserver')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: GameServerCreateDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(
      await service.create({
        ...data,
        connectionInfo: JSON.parse(data.connectionInfo),
      })
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Put('/gameserver/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateGameServerDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(
      await service.update(id, {
        ...data,
        connectionInfo: JSON.parse(data.connectionInfo),
      })
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @Delete('/gameserver/:id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const service = new GameServerService(req.domainId);
    const deletedDomain = await service.delete(id);
    return apiResponse(deletedDomain);
  }
}
