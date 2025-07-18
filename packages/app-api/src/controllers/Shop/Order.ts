import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ShopListingService } from '../../service/Shop/index.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { Response } from 'express';
import { ShopOrderOutputDTO, ShopOrderCreateDTO } from '../../service/Shop/dto.js';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from '../shared.js';

class ShopOrderOutputDTOAPI extends APIOutput<ShopOrderOutputDTO> {
  @Type(() => ShopOrderOutputDTO)
  @ValidateNested()
  declare data: ShopOrderOutputDTO;
}

class ShopOrderOutputArrayDTOAPI extends APIOutput<ShopOrderOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ShopOrderOutputDTO)
  declare data: ShopOrderOutputDTO[];
}

class ShopOrderSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  listingId: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  gameServerId: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  playerId: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  userId: string[];
  @IsOptional()
  @IsNumber({}, { each: true })
  amount: number[];
  @IsOptional()
  @IsString({ each: true })
  status: string[];
}

class ShopOrderSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsNumber()
  amount: number;
}

const shopOrderExtendOptions = ['listing', 'listing.items', 'listing.items.item', 'player'];
type ShopOrderExtendOptions = (typeof shopOrderExtendOptions)[number];

class ShopOrderSearchInputDTO extends ITakaroQuery<ShopOrderSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ShopOrderSearchInputAllowedFilters)
  declare filters: ShopOrderSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ShopOrderSearchInputAllowedRangeFilter)
  declare greaterThan: ShopOrderSearchInputAllowedRangeFilter;

  @ValidateNested()
  @Type(() => ShopOrderSearchInputAllowedRangeFilter)
  declare lessThan: ShopOrderSearchInputAllowedRangeFilter;

  @IsOptional()
  @IsEnum(shopOrderExtendOptions, { each: true })
  declare extend?: ShopOrderExtendOptions[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController('/shop/order')
export class ShopOrderController {
  @UseBefore(AuthService.getAuthMiddleware([]))
  @Post('/')
  @ResponseSchema(ShopOrderOutputDTOAPI)
  async create(@Req() req: AuthenticatedRequest, @Body() item: ShopOrderCreateDTO) {
    const service = new ShopListingService(req.domainId);
    const order = await service.createOrder(item.listingId, item.amount, item.playerId);
    return apiResponse(order);
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopOrderOutputDTOAPI)
  @Get('/:id')
  @OpenAPI({
    summary: 'Get order by ID',
    description:
      'Get an order by its ID. This endpoint only returns orders that belong to the caller. When the caller has permission to view all orders, they can get any order.',
  })
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopListingService(req.domainId);
    return apiResponse(await service.findOneOrder(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopOrderOutputArrayDTOAPI)
  @Post('/search')
  @OpenAPI({
    summary: 'Search orders',
    description:
      'Search for orders. By default, this endpoint only returns your own orders. When the caller has permission to view all orders, they can search for all orders.',
  })
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ShopOrderSearchInputDTO) {
    const service = new ShopListingService(req.domainId);
    const result = await service.findOrders({
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

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopOrderOutputDTOAPI)
  @Post('/:id/claim')
  @OpenAPI({
    summary: 'Claim an order',
    description: 'Claiming an order will mark it as completed and give the user the item in-game',
  })
  async claim(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopListingService(req.domainId);
    return apiResponse(await service.claimOrder(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopOrderOutputDTOAPI)
  @Post('/:id/cancel')
  async cancel(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopListingService(req.domainId);
    const order = await service.cancelOrder(params.id);
    return apiResponse(order);
  }
}
