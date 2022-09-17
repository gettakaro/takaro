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
  Body,
  Get,
  Post,
  Delete,
  JsonController,
  UseBefore,
  Req,
  Put,
  Params,
} from 'routing-controllers';
import { CAPABILITIES } from '../db/role';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';

class GameServerOutputDTOAPI extends APIOutput<GameServerOutputDTO> {
  @Type(() => GameServerOutputDTO)
  @ValidateNested()
  data!: GameServerOutputDTO;
}

class GameServerOutputArrayDTOAPI extends APIOutput<GameServerOutputDTO[]> {
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

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class GameServerController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputArrayDTOAPI)
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
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
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
    @Params() params: ParamId,
    @Body() data: UpdateGameServerDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(
      await service.update(params.id, {
        ...data,
        connectionInfo: JSON.parse(data.connectionInfo),
      })
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @Delete('/gameserver/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const deletedRecord = await service.delete(params.id);
    return apiResponse(deletedRecord);
  }
}
