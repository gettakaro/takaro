import { IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
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
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { moduleProtectionMiddleware } from '../middlewares/moduleProtectionMiddleware.js';
import { AllowedFilters, AllowedSearch } from './shared.js';

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

class FunctionSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  moduleId: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  versionId!: string[];
  @IsOptional()
  @IsString({ each: true })
  name: string[];
}

class FunctionSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name: string[];
}

const functionExtendOptions = ['version', 'cronJob', 'hook', 'command'];
type FunctionExtendOptions = (typeof functionExtendOptions)[number];

class FunctionSearchInputDTO extends ITakaroQuery<FunctionOutputDTO> {
  @ValidateNested()
  @Type(() => FunctionSearchInputAllowedFilters)
  declare filters: FunctionSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => FunctionSearchInputAllowedSearch)
  declare search: FunctionSearchInputAllowedSearch;

  @IsOptional()
  @IsEnum(functionExtendOptions, { each: true })
  declare extend?: FunctionExtendOptions[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class FunctionController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(FunctionOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Search functions',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            withRelations: {
              summary: 'Search with related data',
              value: {
                extend: ['version'],
                page: 1,
                limit: 10,
              },
            },
          },
        },
      },
    },
  })
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
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @Post('/function')
  async create(@Req() req: AuthenticatedRequest, @Body() data: FunctionCreateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(FunctionOutputDTOAPI)
  @Put('/function/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: FunctionUpdateDTO) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(APIOutput)
  @Delete('/function/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
