import { IsOptional, IsUUID, ValidateNested, IsString } from 'class-validator';
import { ITakaroQuery, SortDirection } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ShopCategoryService } from '../../service/Shop/ShopCategoryService.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import {
  Body,
  Get,
  Post,
  JsonController,
  UseBefore,
  Req,
  Params,
  Res,
  Delete,
  Put,
  QueryParams,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import {
  ShopCategoryOutputDTO,
  ShopCategoryUpdateDTO,
  ShopCategoryCreateDTO,
  ShopCategoryMoveDTO,
  ShopCategoryBulkAssignDTO,
} from '../../service/Shop/dto.js';

class ShopCategoryOutputDTOAPI extends APIOutput<ShopCategoryOutputDTO> {
  @Type(() => ShopCategoryOutputDTO)
  @ValidateNested()
  declare data: ShopCategoryOutputDTO;
}

class ShopCategoryOutputArrayDTOAPI extends APIOutput<ShopCategoryOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ShopCategoryOutputDTO)
  declare data: ShopCategoryOutputDTO[];
}

class ShopCategorySearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id!: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  parentId!: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  gameServerId!: string[];
}

class ShopCategorySearchInputAllowedSearch {
  [key: string]: unknown[] | string[] | boolean | null | undefined;

  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class ShopCategorySearchInputDTO extends ITakaroQuery<ShopCategorySearchInputAllowedFilters> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ShopCategorySearchInputAllowedFilters)
  declare filters: ShopCategorySearchInputAllowedFilters;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShopCategorySearchInputAllowedSearch)
  declare search: ShopCategorySearchInputAllowedSearch;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;
}

class GameServerIdQueryParam {
  @IsOptional()
  @IsUUID(4)
  gameServerId?: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController('/shop/category')
export class ShopCategoryController {
  @Post('/search')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopCategoryOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Search shop categories',
    examples: {
      withRelations: {
        summary: 'Search with related data',
        value: {
          extend: ['parent', 'children'],
          page: 1,
          limit: 10,
        },
      },
    },
  })
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ShopCategorySearchInputDTO) {
    const service = new ShopCategoryService(req.domainId);
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

  @Get('/:id')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopCategoryOutputDTOAPI)
  @OpenAPI({
    description: 'Get a shop category by id',
  })
  async getOne(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @QueryParams() query: GameServerIdQueryParam,
  ) {
    const service = new ShopCategoryService(req.domainId);
    const filters = query.gameServerId ? { filters: { gameServerId: [query.gameServerId] } } : undefined;
    return apiResponse(await service.findOne(params.id, filters));
  }

  @Get('/')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopCategoryOutputArrayDTOAPI)
  @OpenAPI({
    description: 'Get all shop categories',
  })
  async getAll(@Req() req: AuthenticatedRequest, @Res() res: Response, @QueryParams() query: GameServerIdQueryParam) {
    const service = new ShopCategoryService(req.domainId);
    const result = await service.find({
      page: res.locals.page,
      limit: res.locals.limit,
      sortBy: 'name',
      sortDirection: SortDirection.asc,
      filters: query.gameServerId ? { gameServerId: [query.gameServerId] } : {},
    });
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @Post('/')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopCategoryOutputDTOAPI)
  @OpenAPI({
    description: 'Create a new shop category',
  })
  async create(@Req() req: AuthenticatedRequest, @Body() data: ShopCategoryCreateDTO) {
    const service = new ShopCategoryService(req.domainId);
    const created = await service.create(data);
    return apiResponse(created);
  }

  @Put('/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopCategoryOutputDTOAPI)
  @OpenAPI({
    description: 'Update a shop category',
  })
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ShopCategoryUpdateDTO) {
    const service = new ShopCategoryService(req.domainId);
    const updated = await service.update(params.id, data);
    return apiResponse(updated);
  }

  @Delete('/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @OpenAPI({
    description: 'Delete a shop category',
  })
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopCategoryService(req.domainId);
    await service.delete(params.id);
    return apiResponse({ success: true });
  }

  @Post('/:id/move')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopCategoryOutputDTOAPI)
  @OpenAPI({
    description: 'Move a shop category to a different parent',
  })
  async move(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ShopCategoryMoveDTO) {
    const service = new ShopCategoryService(req.domainId);
    const moved = await service.moveCategory(params.id, data.parentId || null);
    return apiResponse(moved);
  }

  @Post('/bulk-assign')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @OpenAPI({
    description: 'Bulk assign categories to multiple shop listings',
  })
  async bulkAssign(@Req() req: AuthenticatedRequest, @Body() data: ShopCategoryBulkAssignDTO) {
    const service = new ShopCategoryService(req.domainId);
    await service.bulkAssignCategories(data.listingIds, data.addCategoryIds, data.removeCategoryIds);
    return apiResponse({ success: true });
  }
}
