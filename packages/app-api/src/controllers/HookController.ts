import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { GameEvents } from '@takaro/gameserver';
import {
  HookCreateDTO,
  HookOutputDTO,
  HookService,
  UpdateHookDTO,
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
import { CAPABILITIES } from '../db/role';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators';
import { ItemsThatCanBeAssignedAFunction } from '../db/function';

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
  enabled!: string;

  @IsOptional()
  @IsEnum(GameEvents)
  eventType!: GameEvents;
}

class HookSearchInputDTO extends ITakaroQuery<HookSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => HookSearchInputAllowedFilters)
  filters!: HookSearchInputAllowedFilters;
}

class AssignFunctionToHookDTO {
  @IsUUID('4')
  id!: string;

  @IsUUID('4')
  functionId!: string;
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
    @Req() req: AuthenticatedRequest,
    @Body() query: HookSearchInputDTO
  ) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.find(query));
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
    @Body() data: UpdateHookDTO
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

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_FUNCTIONS,
      CAPABILITIES.MANAGE_HOOKS,
    ])
  )
  @ResponseSchema(HookOutputDTOAPI)
  @OpenAPI({
    description:
      'Assign a function to a hook. This function will execute when the hook is triggered',
  })
  @Post('/hook/:id/function/:functionId')
  async assignFunction(
    @Req() req: AuthenticatedRequest,
    @Params() data: AssignFunctionToHookDTO
  ) {
    const service = new HookService(req.domainId);
    return apiResponse(
      await service.assign({
        type: ItemsThatCanBeAssignedAFunction.HOOK,
        functionId: data.functionId,
        itemId: data.id,
      })
    );
  }

  @UseBefore(
    AuthService.getAuthMiddleware([
      CAPABILITIES.MANAGE_FUNCTIONS,
      CAPABILITIES.MANAGE_HOOKS,
    ])
  )
  @ResponseSchema(HookOutputDTOAPI)
  @OpenAPI({
    description:
      'The function will not be executed when the hook is triggered anymore',
  })
  @Delete('/hook/:id/function/:functionId')
  async unassignFunction(
    @Req() req: AuthenticatedRequest,
    @Params() data: AssignFunctionToHookDTO
  ) {
    const service = new HookService(req.domainId);
    return apiResponse(await service.unAssign(data.id, data.functionId));
  }
}
