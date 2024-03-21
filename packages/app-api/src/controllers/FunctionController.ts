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
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(FunctionOutputDTOAPI)
  @Get('/function/:id')
  @OpenAPI({
    description: 'Retrieve a single function by its ID.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' },
        description: 'ID of the function to retrieve.',
      },
    ],
    responses: {
      '200': {
        description: 'Function details.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FunctionOutputDTOAPI' },
          },
        },
      },
    },
    security: [{ domainAuth: [] }],
  })
  @ResponseSchema(FunctionOutputDTOAPI)
  @Get('/function/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @OpenAPI({
    description: 'Create a new function.',
    requestBody: {
      description: 'Data for creating a new function.',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/FunctionCreateDTO' },
        },
      },
    },
    responses: {
      '200': {
        description: 'Successfully created function.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FunctionOutputDTOAPI' },
          },
        },
      },
    },
    security: [{ domainAuth: [] }],
  })
  @ResponseSchema(FunctionOutputDTOAPI)
  @Post('/function')
  async create(@Req() req: AuthenticatedRequest, @Body() data: FunctionCreateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @OpenAPI({
    description: 'Update a specific function by its ID.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' },
        description: 'ID of the function to update.',
      },
    ],
    requestBody: {
      description: 'Data for updating the function.',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/FunctionUpdateDTO' },
        },
      },
    },
    responses: {
      '200': {
        description: 'Successfully updated the function.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/FunctionOutputDTOAPI' },
          },
        },
      },
    },
    security: [{ domainAuth: [] }],
  })
  @ResponseSchema(FunctionOutputDTOAPI)
  @Put('/function/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: FunctionUpdateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), builtinModuleModificationMiddleware)
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/function/:id')
  @OpenAPI({
    description: 'Delete a specific function by its ID.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' },
        description: 'ID of the function to delete.',
      },
    ],
    responses: {
      '200': {
        description: 'Successfully deleted the function.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/IdUuidDTOAPI' },
          },
        },
      },
    },
    security: [{ domainAuth: [] }],
  })
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/function/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }
}
