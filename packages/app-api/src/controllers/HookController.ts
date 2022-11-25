import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse, PaginatedRequest } from '@takaro/http';
import { GameEvents } from '@takaro/gameserver';
import {
  HookCreateDTO,
  HookOutputDTO,
  HookService,
  HookUpdateDTO,
} from '../service/HookService';
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

export class HookOutputDTOAPI extends APIOutput<HookOutputDTO> {
  @Type(() => HookOutputDTO)
  @ValidateNested()
  data!: HookOutputDTO;
}

export class HookOutputArrayDTOAPI extends APIOutput<HookOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => HookOutputDTO)
  data!: HookOutputDTO[];
}

class HookSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  functionId!: string;

  @IsOptional()
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsEnum(GameEvents)
  eventType!: GameEvents;
}

class HookSearchInputDTO extends ITakaroQuery<HookSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => HookSearchInputAllowedFilters)
  filters!: HookSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class HookController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_HOOKS]))
  @ResponseSchema(HookOutputArrayDTOAPI)
  @Post('/hook/search')
  async search(
    @Req() req: AuthenticatedRequest & PaginatedRequest,
    @Body() query: HookSearchInputDTO
  ) {
    const service = new HookService(req.domainId);
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Get('/hook/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Post('/hook')
  async create(@Req() req: AuthenticatedRequest, @Body() data: HookCreateDTO) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_HOOKS]))
  @ResponseSchema(HookOutputDTOAPI)
  @Put('/hook/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: HookUpdateDTO
  ) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_HOOKS]))
  @ResponseSchema(APIOutput)
  @Delete('/hook/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new HookService(req.domainId);
    const deletedRecord = await service.delete(params.id);
    return apiResponse(deletedRecord);
  }
}
