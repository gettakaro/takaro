import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ShopListingService } from '../../service/Shop/index.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res, Delete, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import {
  ShopListingOutputDTO,
  ShopListingUpdateDTO,
  ShopListingCreateDTO,
  ShopImportOptions,
} from '../../service/Shop/dto.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    // 25MB
    fileSize: 25 * 1024 * 1024,
    fieldSize: 25 * 1024 * 1024,
  },
});
class ShopListingOutputDTOAPI extends APIOutput<ShopListingOutputDTO> {
  @Type(() => ShopListingOutputDTO)
  @ValidateNested()
  declare data: ShopListingOutputDTO;
}

class ShopListingOutputArrayDTOAPI extends APIOutput<ShopListingOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ShopListingOutputDTO)
  declare data: ShopListingOutputDTO[];
}

class ShopListingSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  gameServerId: string[];
  @IsOptional()
  @IsNumber({}, { each: true })
  price: number[];
  @IsOptional()
  @IsString({ each: true })
  name: string[];
  @IsOptional()
  @IsBoolean()
  draft: boolean;
}

class ShopSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsNumber()
  price: number;
  @IsOptional()
  @IsISO8601()
  deletedAt!: string;
}

class ShopListingSearchInputDTO extends ITakaroQuery<ShopListingSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ShopListingSearchInputAllowedFilters)
  declare filters: ShopListingSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ShopListingSearchInputAllowedFilters)
  declare search: ShopListingSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => ShopSearchInputAllowedRangeFilter)
  declare greaterThan: ShopSearchInputAllowedRangeFilter;

  @ValidateNested()
  @Type(() => ShopSearchInputAllowedRangeFilter)
  declare lessThan: ShopSearchInputAllowedRangeFilter;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController('/shop/listing')
export class ShopListingController {
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopListingOutputArrayDTOAPI)
  @Post('/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ShopListingSearchInputDTO) {
    const service = new ShopListingService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(ShopListingOutputDTOAPI)
  @Get('/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopListingService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopListingOutputDTOAPI)
  @Post('/')
  async create(@Req() req: AuthenticatedRequest, @Body() item: ShopListingCreateDTO) {
    const service = new ShopListingService(req.domainId);
    const created = await service.create(new ShopListingCreateDTO(item));
    return apiResponse(created);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopListingOutputDTOAPI)
  @Put('/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() item: ShopListingUpdateDTO) {
    const service = new ShopListingService(req.domainId);
    const updated = await service.update(params.id, item);
    return apiResponse(updated);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @Delete('/:id')
  @ResponseSchema(APIOutput)
  async delete(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ShopListingService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(
    AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]),
    upload.fields([
      { name: 'import', maxCount: 1 },
      { name: 'options', maxCount: 1 },
    ]),
  )
  @ResponseSchema(APIOutput)
  @Post('/import')
  async importListings(@Req() req: AuthenticatedRequest) {
    const service = new ShopListingService(req.domainId);

    const rawImportData = JSON.parse(req.body.import);
    const rawOptions = JSON.parse(req.body.options);

    const importData: ShopListingCreateDTO[] = rawImportData.map((item: any) => new ShopListingCreateDTO(item));
    const options = new ShopImportOptions(rawOptions);

    await Promise.all(importData.map((item) => item.validate()));
    await options.validate();

    await service.import(importData, options);
    return apiResponse();
  }
}
