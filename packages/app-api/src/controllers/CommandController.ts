import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  CommandArgumentCreateDTO,
  CommandArgumentOutputDTO,
  CommandArgumentUpdateDTO,
  CommandCreateDTO,
  CommandOutputDTO,
  CommandService,
  CommandUpdateDTO,
} from '../service/CommandService.js';
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
import { Response } from 'express';

export class CommandOutputDTOAPI extends APIOutput<CommandOutputDTO> {
  @Type(() => CommandOutputDTO)
  @ValidateNested()
  declare data: CommandOutputDTO;
}

export class CommandArgumentDTOAPI extends APIOutput<CommandArgumentOutputDTO> {
  @Type(() => CommandArgumentOutputDTO)
  @ValidateNested()
  declare data: CommandArgumentOutputDTO;
}

export class CommandOutputArrayDTOAPI extends APIOutput<CommandOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => CommandOutputDTO)
  declare data: CommandOutputDTO[];
}

class CommandSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsUUID()
  moduleId!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  enabled!: boolean;
}

export class CommandSearchInputDTO extends ITakaroQuery<CommandOutputDTO> {
  @ValidateNested()
  @Type(() => CommandSearchInputAllowedFilters)
  declare filters: CommandSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class CommandController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_COMMANDS]))
  @ResponseSchema(CommandOutputArrayDTOAPI)
  @Post('/command/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: CommandSearchInputDTO
  ) {
    const service = new CommandService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_COMMANDS]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Get('/command/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Post('/command')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CommandCreateDTO
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Put('/command/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CommandUpdateDTO
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/command/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(CommandArgumentDTOAPI)
  @Post('/command/argument')
  async createArgument(
    @Req() req: AuthenticatedRequest,
    @Body() data: CommandArgumentCreateDTO
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.createArgument(data.commandId, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(CommandArgumentDTOAPI)
  @Put('/command/argument/:id')
  async updateArgument(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CommandArgumentUpdateDTO
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.updateArgument(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_COMMANDS]))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/command/argument/:id')
  async removeArgument(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId
  ) {
    const service = new CommandService(req.domainId);
    await service.deleteArgument(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }
}
