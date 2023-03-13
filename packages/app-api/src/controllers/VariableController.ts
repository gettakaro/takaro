import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  VariableCreateDTO,
  VariableOutputDTO,
  VariablesService,
  VariableUpdateDTO,
} from '../service/VariablesService.js';
import {
  Body,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  Req,
  Res,
  UseBefore,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ParamId } from '../lib/validators.js';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { CAPABILITIES } from '../service/RoleService.js';
import { Response } from 'express';

export class VariableOutputDTOAPI extends APIOutput<VariableOutputDTO> {
  @Type(() => VariableOutputDTO)
  @ValidateNested()
  declare data: VariableOutputDTO;
}

export class VariableOutputArrayDTOAPI extends APIOutput<VariableOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => VariableOutputDTO)
  declare data: VariableOutputDTO[];
}

class VariableSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  id!: string;
}

class VariableSearchInputDTO extends ITakaroQuery<VariableSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => VariableSearchInputAllowedFilters)
  declare filters: VariableSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class VariableController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_VARIABLES]))
  @ResponseSchema(VariableOutputArrayDTOAPI)
  @Post('/variables/search')
  async find(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: VariableSearchInputDTO
  ) {
    const service = new VariablesService(req.domainId);
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

  @Get('/variables/:id')
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_VARIABLES]))
  @ResponseSchema(VariableOutputDTOAPI)
  async findOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new VariablesService(req.domainId);
    const variable = await service.findOne(params.id);
    return apiResponse(variable);
  }

  @Put('/variables/:id')
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_VARIABLES]))
  @ResponseSchema(VariableOutputDTOAPI)
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() body: VariableUpdateDTO
  ) {
    const service = new VariablesService(req.domainId);
    const variable = await service.update(params.id, body);
    return apiResponse(variable);
  }

  @Post('/variables')
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_VARIABLES]))
  @ResponseSchema(VariableOutputDTOAPI)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: VariableCreateDTO
  ) {
    const service = new VariablesService(req.domainId);
    const variable = await service.create(body);
    return apiResponse(variable);
  }

  @Delete('/variables/:id')
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_VARIABLES]))
  @ResponseSchema(VariableOutputDTOAPI)
  async delete(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new VariablesService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
