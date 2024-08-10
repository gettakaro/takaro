import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  CommandArgumentCreateDTO,
  CommandArgumentOutputDTO,
  CommandArgumentUpdateDTO,
  CommandCreateDTO,
  CommandOutputDTO,
  CommandService,
  CommandTriggerDTO,
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
  QueryParam,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { builtinModuleModificationMiddleware } from '../middlewares/builtinModuleModification.js';
import { EventService, EVENT_TYPES } from '../service/EventService.js';
import { EventOutputArrayDTOAPI, EventSearchInputDTO } from './EventController.js';

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
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  moduleId!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsBoolean({ each: true })
  enabled!: boolean[];
}

export class CommandSearchInputDTO extends ITakaroQuery<CommandOutputDTO> {
  @ValidateNested()
  @Type(() => CommandSearchInputAllowedFilters)
  declare filters: CommandSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => CommandSearchInputAllowedFilters)
  declare search: CommandSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class CommandController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(CommandOutputArrayDTOAPI)
  @Post('/command/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: CommandSearchInputDTO) {
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Get('/command/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CommandOutputDTOAPI)
  @Post('/command')
  async create(@Req() req: AuthenticatedRequest, @Body() data: CommandCreateDTO) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CommandOutputDTOAPI)
  @Put('/command/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: CommandUpdateDTO) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(APIOutput)
  @Delete('/command/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CommandArgumentDTOAPI)
  @Post('/command/argument')
  async createArgument(@Req() req: AuthenticatedRequest, @Body() data: CommandArgumentCreateDTO) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.createArgument(data.commandId, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(CommandArgumentDTOAPI)
  @Put('/command/argument/:id')
  async updateArgument(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: CommandArgumentUpdateDTO,
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.updateArgument(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(APIOutput)
  @Delete('/command/argument/:id')
  async removeArgument(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    await service.deleteArgument(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @Post('/command/:id/trigger')
  async trigger(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: CommandTriggerDTO) {
    const service = new CommandService(req.domainId);
    await service.trigger(params.id, data);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(EventOutputArrayDTOAPI)
  @Post('/command/:id/executions')
  async getExecutions(
    @Params() params: ParamId,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: EventSearchInputDTO,
    @QueryParam('success') success = false,
  ) {
    const service = new EventService(req.domainId);
    const result = await service.metadataSearch(
      {
        ...query,
        filters: { ...query.filters, eventName: [EVENT_TYPES.COMMAND_EXECUTED] },
      },
      [
        {
          logicalOperator: 'AND',
          filters: [
            { field: 'command.id', operator: '=', value: params.id },
            { field: 'result.success', operator: '=', value: success },
          ],
        },
      ],
    );

    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }
}
