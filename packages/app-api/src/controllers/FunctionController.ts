import { IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse, PaginatedRequest } from '@takaro/http';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
  FunctionUpdateDTO,
} from '../service/FunctionService';
import { AuthenticatedRequest, AuthService } from '../service/AuthService';
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
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';
import { CAPABILITIES } from '../service/RoleService';

@OpenAPI({
  security: [{ domainAuth: [] }],
})
class FunctionOutputDTOAPI extends APIOutput<FunctionOutputDTO> {
  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  data!: FunctionOutputDTO;
}

class FunctionOutputArrayDTOAPI extends APIOutput<FunctionOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => FunctionOutputDTO)
  data!: FunctionOutputDTO[];
}

class FunctionSearchInputAllowedFilters {
  @IsUUID()
  id!: string;
}

class FunctionSearchInputDTO extends ITakaroQuery<FunctionOutputDTO> {
  @ValidateNested()
  @Type(() => FunctionSearchInputAllowedFilters)
  filters!: FunctionSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class FunctionController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_FUNCTIONS]))
  @ResponseSchema(FunctionOutputArrayDTOAPI)
  @Post('/function/search')
  async search(
    @Req() req: AuthenticatedRequest & PaginatedRequest,
    @Body() query: FunctionSearchInputDTO
  ) {
    const service = new FunctionService(req.domainId);
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_FUNCTIONS]))
  @ResponseSchema(FunctionOutputDTOAPI)
  @Get('/function/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_FUNCTIONS]))
  @ResponseSchema(FunctionOutputArrayDTOAPI)
  @OpenAPI({
    description:
      'Get functions that will be executed when an item (cronjob, command or hook) is executed',
  })
  @Get('/function/related/:id')
  async getRelated(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId
  ) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.getRelatedFunctions(params.id, false));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_FUNCTIONS]))
  @ResponseSchema(FunctionOutputDTOAPI)
  @Post('/function')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: FunctionCreateDTO
  ) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_FUNCTIONS]))
  @ResponseSchema(FunctionOutputDTOAPI)
  @Put('/function/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: FunctionUpdateDTO
  ) {
    const service = new FunctionService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_FUNCTIONS]))
  @ResponseSchema(APIOutput)
  @Delete('/function/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new FunctionService(req.domainId);
    const deletedRecord = await service.delete(params.id);
    return apiResponse(deletedRecord);
  }
}
