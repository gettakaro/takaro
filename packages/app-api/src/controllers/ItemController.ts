import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString, IsUUID } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ItemsOutputDTO, ItemsService } from '../service/ItemsService.js';
import { Body, Get, JsonController, Params, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ParamId } from '../lib/validators.js';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';

export class ItemOutputDTOAPI extends APIOutput<ItemsOutputDTO> {
  @Type(() => ItemsOutputDTO)
  @ValidateNested()
  declare data: ItemsOutputDTO;
}

export class ItemOutputArrayDTOAPI extends APIOutput<ItemsOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ItemsOutputDTO)
  declare data: ItemsOutputDTO[];
}

class ItemSearchInputAllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  id!: string[];

  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsString({ each: true })
  code!: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  gameserverId!: string[];
}

class ItemSearchInputDTO extends ITakaroQuery<ItemSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ItemSearchInputAllowedFilters)
  declare filters: ItemSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ItemSearchInputAllowedFilters)
  declare search: ItemSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class ItemController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ITEMS]))
  @ResponseSchema(ItemOutputArrayDTOAPI)
  @Post('/items/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ItemSearchInputDTO) {
    const service = new ItemsService(req.domainId);
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

  @Get('/items/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ITEMS]))
  @ResponseSchema(ItemOutputDTOAPI)
  async findOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ItemsService(req.domainId);
    const Item = await service.findOne(params.id);
    return apiResponse(Item);
  }
}
