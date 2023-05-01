import {
  IsEnum,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO } from '@takaro/util';
import {
  TestReachabilityOutput,
  CommandOutput,
  IMessageOptsDTO,
} from '@takaro/gameserver';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerService,
  GameServerUpdateDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallDTO,
} from '../service/GameServerService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
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
  Res,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { GAME_SERVER_TYPE } from '../db/gameserver.js';
import { Response } from 'express';

class GameServerOutputDTOAPI extends APIOutput<GameServerOutputDTO> {
  @Type(() => GameServerOutputDTO)
  @ValidateNested()
  declare data: GameServerOutputDTO;
}

class GameServerOutputArrayDTOAPI extends APIOutput<GameServerOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => GameServerOutputDTO)
  declare data: GameServerOutputDTO[];
}

class GameServerTestReachabilityDTOAPI extends APIOutput<TestReachabilityOutput> {
  @Type(() => TestReachabilityOutput)
  @ValidateNested()
  declare data: TestReachabilityOutput;
}

class GameServerSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

class GameServerSearchInputDTO extends ITakaroQuery<GameServerOutputDTO> {
  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedFilters)
  declare filters: GameServerSearchInputAllowedFilters;
}

class GameServerTestReachabilityInputDTO extends TakaroDTO<GameServerTestReachabilityInputDTO> {
  @IsJSON()
  connectionInfo: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
}

class ParamIdAndModuleId {
  @IsUUID('4')
  gameserverId!: string;

  @IsUUID('4')
  moduleId!: string;
}

class ModuleInstallationOutputDTOAPI extends APIOutput<ModuleInstallationOutputDTO> {
  @Type(() => ModuleInstallationOutputDTO)
  @ValidateNested()
  declare data: ModuleInstallationOutputDTO;
}

class ModuleInstallationOutputArrayDTOAPI extends APIOutput<
  ModuleInstallationOutputDTO[]
> {
  @Type(() => ModuleInstallationOutputDTO)
  @ValidateNested({ each: true })
  declare data: ModuleInstallationOutputDTO[];
}

class CommandExecuteDTOAPI extends APIOutput<CommandOutput> {
  @Type(() => CommandOutput)
  @ValidateNested()
  declare data: CommandOutput;
}
class CommandExecuteInputDTO extends TakaroDTO<CommandExecuteInputDTO> {
  @IsString()
  @MinLength(1)
  command!: string;
}

class MessageSendInputDTO extends TakaroDTO<MessageSendInputDTO> {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  message!: string;

  @Type(() => IMessageOptsDTO)
  @ValidateNested()
  @IsOptional()
  opts!: IMessageOptsDTO;
}

class TeleportPlayerInputDTO extends TakaroDTO<TeleportPlayerInputDTO> {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  playerGameId!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  x: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  y: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  z: number;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class GameServerController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputArrayDTOAPI)
  @Post('/gameserver/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: GameServerSearchInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const result = await service.find({
      ...query,
      page: res.locals.page,
      limit: res.locals.limit,
    });
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Get('/gameserver/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Post('/gameserver')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: GameServerCreateDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @Put('/gameserver/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: GameServerUpdateDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/gameserver/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerTestReachabilityDTOAPI)
  @Get('/gameserver/:id/reachability')
  async testReachabilityForId(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId
  ) {
    const service = new GameServerService(req.domainId);
    const res = await service.testReachability(params.id);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerTestReachabilityDTOAPI)
  @Post('/gameserver/reachability')
  async testReachability(
    @Req() req: AuthenticatedRequest,
    @Body() data: GameServerTestReachabilityInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const res = await service.testReachability(
      undefined,
      JSON.parse(data.connectionInfo),
      data.type
    );
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @Get('/gameserver/:gameserverId/module/:moduleId')
  async getModuleInstallation(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndModuleId
  ) {
    const service = new GameServerService(req.domainId);
    const res = await service.getModuleInstallation(
      params.gameserverId,
      params.moduleId
    );
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputArrayDTOAPI)
  @Get('/gameserver/:id/modules')
  async getInstalledModules(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId
  ) {
    const service = new GameServerService(req.domainId);
    const res = await service.getInstalledModules({ gameserverId: params.id });
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @Post('/gameserver/:gameserverId/modules/:moduleId')
  async installModule(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndModuleId,
    @Body() data: ModuleInstallDTO
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(
      await service.installModule(params.gameserverId, params.moduleId, data)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @Delete('/gameserver/:gameserverId/modules/:moduleId')
  async uninstallModule(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndModuleId
  ) {
    const service = new GameServerService(req.domainId);
    return apiResponse(
      await service.uninstallModule(params.gameserverId, params.moduleId)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(CommandExecuteDTOAPI)
  @Post('/gameserver/:id/command')
  async executeCommand(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CommandExecuteInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const result = await service.executeCommand(params.id, data.command);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @Post('/gameserver/:id/message')
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: MessageSendInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const result = await service.sendMessage(
      params.id,
      data.message,
      data.opts
    );
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @Post('/gameserver/:id/teleportPlayer')
  async teleportPlayer(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: TeleportPlayerInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const result = await service.teleportPlayer(params.id, data.playerGameId, {
      x: data.x,
      y: data.y,
      z: data.z,
    });
    return apiResponse(result);
  }
}
