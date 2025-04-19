import {
  IsBoolean,
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
import { errors, logger, TakaroDTO } from '@takaro/util';
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
  JobStatusOutputDTO,
} from '../service/GameServerService.js';
import { AuthenticatedRequest, AuthService, checkPermissions } from '../service/AuthService.js';
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
  ContentType,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId, PogParam } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { PlayerOnGameserverOutputDTOAPI } from './PlayerOnGameserverController.js';
import { UserService } from '../service/User/index.js';
import { AllowedFilters, AllowedSearch } from './shared.js';
import multer from 'multer';
import { SystemTaskType } from '../workers/systemWorkerDefinitions.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    // 25MB
    fileSize: 25 * 1024 * 1024,
    fieldSize: 25 * 1024 * 1024,
  },
});

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

class GameServerSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsEnum(GAME_SERVER_TYPE, { each: true })
  type!: GAME_SERVER_TYPE[];

  @IsOptional()
  @IsBoolean({ each: true })
  reachable!: boolean[];

  @IsOptional()
  @IsBoolean({ each: true })
  enabled!: boolean[];
}

class GameServerSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class GameServerSearchInputDTO extends ITakaroQuery<GameServerOutputDTO> {
  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedFilters)
  declare filters: GameServerSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => GameServerSearchInputAllowedSearch)
  declare search: GameServerSearchInputAllowedSearch;
}

class GameServerTestReachabilityInputDTO extends TakaroDTO<GameServerTestReachabilityInputDTO> {
  @IsJSON()
  connectionInfo: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
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
  @IsString()
  quality: string;
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

export class ImportInputDTO extends TakaroDTO<ImportInputDTO> {
  @IsBoolean()
  roles: boolean;
  @IsBoolean()
  players: boolean;
  @IsBoolean()
  currency: boolean;
  @IsBoolean()
  shop: boolean;
}
export class JobStatusOutputDTOAPI extends APIOutput<JobStatusOutputDTO> {
  @Type(() => JobStatusOutputDTO)
  @ValidateNested()
  declare data: JobStatusOutputDTO;
}

class ImportOutputDTO extends TakaroDTO<ImportOutputDTO> {
  @IsString()
  id!: string;
}

class MapTileInputDTO extends TakaroDTO<MapTileInputDTO> {
  @IsUUID('4')
  id: string;
  @IsNumber()
  z: number;
  @IsNumber()
  x: number;
  @IsNumber()
  y: number;
}

class ImportOutputDTOAPI extends APIOutput<ImportOutputDTO> {
  @Type(() => ImportOutputDTO)
  @ValidateNested()
  declare data: ImportOutputDTO;
}

export class GetJobInputDTO {
  @IsEnum(['csmmImport', ...Object.values(SystemTaskType)], {
    message: `key must be one of: ${[...Object.values(SystemTaskType), 'csmmImport'].join(', ')}`,
  })
  type: 'csmmImport' | SystemTaskType;
  @IsString()
  id: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class GameServerController {
  @UseBefore(AuthService.getAuthMiddleware([]))
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

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(GameServerTypesOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch gameserver types (7dtd, Rust, ...)',
  })
  @Get('/gameserver/types')
  async getTypes(@Req() req: AuthenticatedRequest) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.getTypes());
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(GameServerOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch a gameserver by id',
  })
  @Get('/gameserver/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    const userService = new UserService(req.domainId);
    const user = await userService.findOne(req.user.id);
    const hasManageServerPermission = checkPermissions([PERMISSIONS.MANAGE_GAMESERVERS], user);
    return apiResponse(await service.findOne(params.id, hasManageServerPermission));
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

  @UseBefore(AuthService.getAuthMiddleware([]))
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

  @UseBefore(AuthService.getAuthMiddleware([]))
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(CommandExecuteDTOAPI)
  @OpenAPI({
    description: 'Execute a raw command on a gameserver. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:id/command')
  async executeCommand(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CommandExecuteInputDTO,
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
    await service.sendMessage(params.id, data.message, data.opts);
    return apiResponse();
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
    @Body() data: TeleportPlayerInputDTO,
  ) {
    const service = new GameServerService(req.domainId);
    await service.teleportPlayer(params.gameServerId, params.playerId, {
      x: data.x,
      y: data.y,
      z: data.z,
    });
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Kick a player from a gameserver. Requires gameserver to be online and reachable.',
  })
  @Post('/gameserver/:gameServerId/player/:playerId/kick')
  async kickPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam, @Body() data: KickPlayerInputDTO) {
    const service = new GameServerService(req.domainId);
    await service.kickPlayer(params.gameServerId, params.playerId, data.reason);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Ban a player from a gameserver. Requires gameserver to be online and reachable.',
    deprecated: true,
  })
  @Post('/gameserver/:gameServerId/player/:playerId/ban')
  async banPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam, @Body() data: BanPlayerInputDTO) {
    const service = new GameServerService(req.domainId);
    await service.banPlayer(params.gameServerId, params.playerId, data.reason, data.expiresAt);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    description: 'Unban a player from a gameserver. Requires gameserver to be online and reachable.',
    deprecated: true,
  })
  @Post('/gameserver/:gameServerId/player/:playerId/unban')
  async unbanPlayer(@Req() req: AuthenticatedRequest, @Params() params: PogParam) {
    const service = new GameServerService(req.domainId);
    await service.unbanPlayer(params.gameServerId, params.playerId);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(BanPlayerOutputDTO)
  @OpenAPI({
    description: 'List bans for a gameserver. Requires gameserver to be online and reachable.',
    deprecated: true,
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
    await service.giveItem(params.gameServerId, params.playerId, data.name, data.amount, data.quality);
    return apiResponse();
  }

  @Post('/gameserver/:id/shutdown')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @OpenAPI({
    description:
      // eslint-disable-next-line quotes
      "Shuts down the gameserver. This is a 'soft' shutdown, meaning the gameserver will be stopped gracefully. If the gameserver is not reachable, this will have no effect. Note that most hosting providers will automatically restart the gameserver after a shutdown, which makes this operation act as a 'restart' instead.",
  })
  async shutdown(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    await service.shutdown(params.id);
    return apiResponse();
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

  @Get('/gameserver/job/:type/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @OpenAPI({
    description: 'Fetch a job status',
  })
  @ResponseSchema(JobStatusOutputDTOAPI)
  async getJob(@Req() req: AuthenticatedRequest, @Params() params: GetJobInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.getJob(params);
    return apiResponse(result);
  }

  @Post('/gameserver/job/:type/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @OpenAPI({
    description: 'Manually trigger a job, you can poll the status with the GET endpoint',
  })
  @ResponseSchema(JobStatusOutputDTOAPI)
  async triggerJob(@Req() req: AuthenticatedRequest, @Params() params: GetJobInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.triggerJob(params);
    return apiResponse(result);
  }

  @Get('/gameserver/import/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]))
  @ResponseSchema(JobStatusOutputDTOAPI)
  @OpenAPI({
    description: 'Fetch status of an import from CSMM',
    deprecated: true,
  })
  async getImport(@Req() req: AuthenticatedRequest, @Params() params: ImportOutputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.getCSMMImport(params.id);
    return apiResponse(result);
  }

  @Post('/gameserver/import')
  @UseBefore(
    AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_GAMESERVERS]),
    upload.fields([
      { name: 'import', maxCount: 1 },
      { name: 'options', maxCount: 1 },
    ]),
  )
  @OpenAPI({
    description: 'Import a gameserver from CSMM.',
  })
  @ResponseSchema(ImportOutputDTOAPI)
  async importFromCSMM(@Req() req: AuthenticatedRequest) {
    const log = logger('importFromCSMM');
    const service = new GameServerService(req.domainId);

    const rawImportData = req.body.import;
    const rawOptions = req.body.options;

    let validatedOptions: ImportInputDTO | null = null;
    let parsedImportData: Record<string, unknown> | null = null;

    try {
      validatedOptions = new ImportInputDTO(JSON.parse(rawOptions));
      await validatedOptions.validate();
    } catch (error) {
      log.warn('Invalid options', error);
      throw new errors.BadRequestError('Invalid options');
    }

    try {
      parsedImportData = JSON.parse(rawImportData);
    } catch (error) {
      log.warn('Invalid import data', error);
      throw new errors.BadRequestError('Invalid import data');
    }

    if (!parsedImportData) throw new errors.BadRequestError('Invalid import data');

    const result = await service.import(parsedImportData, validatedOptions);
    return apiResponse(result);
  }

  @Get('/gameserver/:id/map/info')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @OpenAPI({
    description: 'Get map metadata for Leaflet',
  })
  async getMapInfo(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new GameServerService(req.domainId);
    return apiResponse(await service.getMapInfo(params.id));
  }

  @Get('/gameserver/:id/map/tile/:x/:y/:z')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ContentType('image/png')
  @OpenAPI({
    description: 'Get a map tile for Leaflet',
  })
  async getMapTile(@Req() req: AuthenticatedRequest, @Params() params: MapTileInputDTO) {
    const service = new GameServerService(req.domainId);
    const result = await service.getMapTile(params.id, params.x, params.y, params.z);
    return result;
  }
}
