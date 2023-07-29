import { IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
  FunctionUpdateDTO,
} from '../service/FunctionService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { builtinModuleModificationMiddleware } from '../middlewares/builtinModuleModification.js';

@OpenAPI({
  security: [{ domainAuth: [] }],
})
class FunctionOutputDTOAPI extends APIOutput<FunctionOutputDTO> {
  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  declare data: FunctionOutputDTO;
}

class FunctionOutputArrayDTOAPI extends APIOutput<FunctionOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => FunctionOutputDTO)
  declare data: FunctionOutputDTO[];
}

class FunctionSearchInputAllowedFilters {
  @IsUUID(4, { each: true })
  id!: string[];
}

class FunctionSearchInputDTO extends ITakaroQuery<FunctionOutputDTO> {
  @ValidateNested()
  @Type(() => FunctionSearchInputAllowedFilters)
  declare filters: FunctionSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => FunctionSearchInputAllowedFilters)
  declare search: FunctionSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class FunctionController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_FUNCTIONS]))
  @ResponseSchema(FunctionOutputArrayDTOAPI)
  @Post('/function/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: FunctionSearchInputDTO) {
    const service = new FunctionService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_FUNCTIONS]))
  @ResponseSchema(FunctionOutputDTOAPI)
  @Get('/function/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_FUNCTIONS]), builtinModuleModificationMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @Post('/function')
  async create(@Req() req: AuthenticatedRequest, @Body() data: FunctionCreateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_FUNCTIONS]), builtinModuleModificationMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @Put('/function/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: FunctionUpdateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_FUNCTIONS]), builtinModuleModificationMiddleware)
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/function/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }
}
