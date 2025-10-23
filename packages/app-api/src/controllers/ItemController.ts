import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ItemsOutputDTO, ItemsService } from '../service/ItemsService.js';
import { Body, Get, JsonController, Params, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ParamId } from '../lib/validators.js';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, AllowedSearch } from './shared.js';

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

class ItemSearchInputAllowedFilters extends AllowedFilters {
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

class ItemSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
  @IsOptional()
  @IsString({ each: true })
  code!: string[];
}

const itemExtendOptions = ['gameserver'];
type ItemExtendOptions = (typeof itemExtendOptions)[number];

class ItemSearchInputDTO extends ITakaroQuery<ItemSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ItemSearchInputAllowedFilters)
  declare filters: ItemSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ItemSearchInputAllowedSearch)
  declare search: ItemSearchInputAllowedSearch;

  @IsOptional()
  @IsEnum(itemExtendOptions, { each: true })
  declare extend?: ItemExtendOptions[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class ItemController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ITEMS]))
  @ResponseSchema(ItemOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Search items',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            withRelations: {
              summary: 'Search with related data',
              value: {
                extend: ['gameserver'],
                page: 1,
                limit: 10,
              },
            },
          },
        },
      },
    },
  })
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
