import { IsOptional, IsUUID, IsISO8601, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Get, JsonController, UseBefore, Req, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { ShopAnalyticsService } from '../service/Shop/ShopAnalyticsService.js';
import { ShopAnalyticsOutputDTO } from '../service/Shop/dto.js';
import { TakaroDTO } from '@takaro/util';

class ShopAnalyticsOutputDTOAPI extends APIOutput<ShopAnalyticsOutputDTO> {
  @ValidateNested()
  @Type(() => ShopAnalyticsOutputDTO)
  declare data: ShopAnalyticsOutputDTO;
}

class ShopAnalyticsQueryDTO extends TakaroDTO<ShopAnalyticsQueryDTO> {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  gameServerIds?: string[];

  @IsISO8601()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class AnalyticsController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SHOP_LISTINGS]))
  @ResponseSchema(ShopAnalyticsOutputDTOAPI)
  @OpenAPI({
    summary: 'Get shop analytics',
    description: 'Retrieve comprehensive analytics for shop performance across selected game servers',
  })
  @Get('/analytics/shop')
  async getShopAnalytics(@Req() req: AuthenticatedRequest, @QueryParams() query: ShopAnalyticsQueryDTO) {
    const service = new ShopAnalyticsService(req.domainId);
    const analytics = await service.getAnalytics(query.gameServerIds, query.startDate, query.endDate);
    return apiResponse(analytics);
  }
}