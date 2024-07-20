import {
  IsEnum,
  IsISO8601,
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
  TestReachabilityOutputDTO,
  CommandOutput,
  IMessageOptsDTO,
  GAME_SERVER_TYPE,
  BanDTO,
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
  UploadedFile,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId, PogParam } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { PlayerOnGameserverOutputDTOAPI } from './PlayerOnGameserverController.js';

class GameServerTypesOutputDTOAPI extends APIOutput<GameServerOutputDTO[]> {
  @Type(() => GameServerOutputDTO)
  @ValidateNested({ each: true })
  declare data: GameServerOutputDTO[];
}

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

class GameServerTestReachabilityDTOAPI extends APIOutput<TestReachabilityOutputDTO> {
  @Type(() => TestReachabilityOutputDTO)
  @ValidateNested()
  declare data: TestReachabilityOutputDTO;
}

class GameServerSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsEnum(GAME_SERVER_TYPE, { each: true })
  type!: GAME_SERVER_TYPE[];
}

class GameServerSearchInputDTO extends ITakaroQuery<GameServerOutputDTO> {
  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedFilters)
  declare filters: GameServerSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedFilters)
  declare search: GameServerSearchInputAllowedFilters;
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
  gameServerId!: string;

  @IsUUID('4')
  moduleId!: string;
}

class ModuleInstallationOutputDTOAPI extends APIOutput<ModuleInstallationOutputDTO> {
  @Type(() => ModuleInstallationOutputDTO)
  @ValidateNested()
  declare data: ModuleInstallationOutputDTO;
}

class ModuleInstallationOutputArrayDTOAPI extends APIOutput<ModuleInstallationOutputDTO[]> {
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
  message!: string;

  @Type(() => IMessageOptsDTO)
  @ValidateNested()
  @IsOptional()
  opts!: IMessageOptsDTO;
}

class GiveItemInputDTO extends TakaroDTO<GiveItemInputDTO> {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  amount: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  quality: number;
}

class TeleportPlayerInputDTO extends TakaroDTO<TeleportPlayerInputDTO> {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  x: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  y: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  z: number;
}

class KickPlayerInputDTO extends TakaroDTO<KickPlayerInputDTO> {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  reason!: string;
}

class BanPlayerInputDTO extends TakaroDTO<BanPlayerInputDTO> {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  @IsOptional()
  reason!: string;

  @IsISO8601()
  @IsOptional()
  expiresAt!: string;
}

class BanPlayerOutputDTO extends APIOutput<BanDTO[]> {
  @Type(() => BanDTO)
  @ValidateNested({ each: true })
  declare data: BanDTO[];
}

class ImportOutputDTO extends TakaroDTO<ImportOutputDTO> {
  @IsString()
  id!: string;
}

class ImportOutputDTOAPI extends APIOutput<ImportOutputDTO> {
  @Type(() => ImportOutputDTO)
  @ValidateNested()
  declare data: ImportOutputDTO;
}
@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class GameServerController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Fetch gameservers',
  })
  @Post('/gameserver/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: GameServerSearchInputDTO) {
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
  @ResponseSchema(GameServerTypesOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch gameserver types (7dtd, Rust, ...)',
  })
  @Get('/gameserver/types')
  async getTypes(@Req() req: AuthenticatedRequest) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.getTypes());
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch a gameserver by id',
  })
  @Get('/gameserver/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @OpenAPI({
    description: 'Create a gameserver',
  })
  @Post('/gameserver')
  async create(@Req() req: AuthenticatedRequest, @Body() data: GameServerCreateDTO) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @OpenAPI({
    description: 'Update a gameserver',
  })
  @Put('/gameserver/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: GameServerUpdateDTO) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Delete a gameserver',
  })
  @Delete('/gameserver/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerTestReachabilityDTOAPI)
  @OpenAPI({
    description: 'Test if Takaro can connect to a gameserver. Will do a thorough check and report details.',
  })
  @Get('/gameserver/:id/reachability')
  async testReachabilityForId(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const res = await service.testReachability(params.id);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(GameServerTestReachabilityDTOAPI)
  @OpenAPI({
    description: 'Test if Takaro can connect to a gameserver. Will do a thorough check and report details.',
  })
  @Post('/gameserver/reachability')
  async testReachability(@Req() req: AuthenticatedRequest, @Body() data: GameServerTestReachabilityInputDTO) {
    const service = new GameServerService(req.domainId);
    const res = await service.testReachability(undefined, JSON.parse(data.connectionInfo), data.type);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    description: 'Get a module installation by id',
  })
  @Get('/gameserver/:gameServerId/module/:moduleId')
  async getModuleInstallation(@Req() req: AuthenticatedRequest, @Params() params: ParamIdAndModuleId) {
    const service = new GameServerService(req.domainId);
    const res = await service.getModuleInstallation(params.gameServerId, params.moduleId);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Get all module installations for a gameserver',
  })
  @Get('/gameserver/:id/modules')
  async getInstalledModules(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const res = await service.getInstalledModules({ gameserverId: params.id });
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    description: 'Install a module on a gameserver. If the module is already installed, it will be updated.',
  })
  @Post('/gameserver/:gameServerId/modules/:moduleId')
  async installModule(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndModuleId,
    @Body() data?: ModuleInstallDTO
  ) {
    const service = new GameServerService(req.domainId);

    return apiResponse(await service.installModule(params.gameServerId, params.moduleId, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ModuleInstallationOutputDTOAPI)
  @OpenAPI({
    description: 'Uninstall a module from a gameserver. This will not delete the module from the database.',
  })
  @Delete('/gameserver/:gameServerId/modules/:moduleId')
  async uninstallModule(@Req() req: AuthenticatedRequest, @Params() params: ParamIdAndModuleId) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.uninstallModule(params.gameServerId, params.moduleId));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(CommandExecuteDTOAPI)
  @OpenAPI({
    description: 'Execute a raw command on a gameserver. Requires gameserver to be online and reachable.',
  })
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
  @OpenAPI({
    description: 'Send a message in gameserver chat. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:id/message')
  async sendMessage(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: MessageSendInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.sendMessage(params.id, data.message, data.opts);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Teleport a player to a location. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:gameServerId/player/:playerId/teleport')
  async teleportPlayer(
    @Req() req: AuthenticatedRequest,
    @Params() params: PogParam,
    @Body() data: TeleportPlayerInputDTO
  ) {
    const service = new GameServerService(req.domainId);
    const result = await service.teleportPlayer(params.gameServerId, params.playerId, {
      x: data.x,
      y: data.y,
      z: data.z,
    });
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Kick a player from a gameserver. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:gameServerId/player/:playerId/kick')
  async kickPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam, @Body() data: KickPlayerInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.kickPlayer(params.gameServerId, params.playerId, data.reason);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Ban a player from a gameserver. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:gameServerId/player/:playerId/ban')
  async banPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam, @Body() data: BanPlayerInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.banPlayer(params.gameServerId, params.playerId, data.reason, data.expiresAt);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Unban a player from a gameserver. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:gameServerId/player/:playerId/unban')
  async unbanPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam) {
    const service = new GameServerService(req.domainId);
    const result = await service.unbanPlayer(params.gameServerId, params.playerId);
    return apiResponse(result);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(BanPlayerOutputDTO)
  @OpenAPI({
    description: 'List bans for a gameserver. Requires gameserver to be online and reachable.',
  })
  @Get('/gameserver/:id/bans')
  async listBans(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const result = await service.listBans(params.id);
    return apiResponse(result);
  }

  @Post('/gameserver/:gameServerId/player/:playerId/giveItem')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @OpenAPI({
    description:
      // eslint-disable-next-line quotes
      "Give an item to a player. Requires gameserver to be online and reachable. Depending on the underlying game implementation, it's possible that the item is dropped on the ground instead of placed directly in the player's inventory.",
  })
  async giveItem(@Req() req: AuthenticatedRequest, @Params() params: PogParam, @Body() data: GiveItemInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.giveItem(params.gameServerId, params.playerId, data.name, data.amount, data.quality);
    return apiResponse(result);
  }

  @Get('/gameserver/:id/players')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @OpenAPI({
    description: 'Fetch a list of players on a gameserver. Requires gameserver to be online and reachable.',
  })
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  async getPlayers(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const result = await service.getPlayers(params.id);
    return apiResponse(result);
  }

  @Get('/gameserver/import/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(ImportOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch status of an import from CSMM',
  })
  async getImport(@Req() req: AuthenticatedRequest, @Params() params: ImportOutputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.getImport(params.id);
    return apiResponse(result);
  }

  @Post('/gameserver/import')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @OpenAPI({
    description: 'Import a gameserver from CSMM.',
  })
  @ResponseSchema(ImportOutputDTOAPI)
  async importFromCSMM(@Req() req: AuthenticatedRequest, @UploadedFile('import.json') _file: Express.Multer.File) {
    const service = new GameServerService(req.domainId);
    const result = await service.import(_file);
    return apiResponse(result);
  }
}
