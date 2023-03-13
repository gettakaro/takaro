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
import { ParamId } from '../lib/validators.js';
import { CAPABILITIES } from '../service/RoleService.js';
import { Response } from 'express';

export class CommandOutputDTOAPI extends APIOutput<CommandOutputDTO> {
  @Type(() => CommandOutputDTO)
  @ValidateNested()
  declare data: CommandOutputDTO;
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
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_COMMANDS]))
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

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_COMMANDS]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Get('/command/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_COMMANDS]))
  @ResponseSchema(CommandOutputDTOAPI)
  @Post('/command')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CommandCreateDTO
  ) {
    const service = new CommandService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_COMMANDS]))
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

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_COMMANDS]))
  @ResponseSchema(APIOutput)
  @Delete('/command/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new CommandService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
