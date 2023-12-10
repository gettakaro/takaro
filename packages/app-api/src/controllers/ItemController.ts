import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ItemCreateDTO, ItemsOutputDTO, ItemsService, ItemUpdateDTO } from '../service/ItemsService.js';
import { Body, Delete, Get, JsonController, Params, Post, Put, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
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
  name!: string[];

  @IsOptional()
  @IsString({ each: true })
  code!: string[];
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

  @Put('/items/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ITEMS]))
  @ResponseSchema(ItemOutputDTOAPI)
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() body: ItemUpdateDTO) {
    const service = new ItemsService(req.domainId);
    const Item = await service.update(params.id, body);
    return apiResponse(Item);
  }

  @Post('/items')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ITEMS]))
  @ResponseSchema(ItemOutputDTOAPI)
  async create(@Req() req: AuthenticatedRequest, @Body() body: ItemCreateDTO) {
    const service = new ItemsService(req.domainId);
    const Item = await service.create(body);
    return apiResponse(Item);
  }

  @Delete('/items/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ITEMS]))
  @ResponseSchema(IdUuidDTOAPI)
  async delete(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ItemsService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }
}
