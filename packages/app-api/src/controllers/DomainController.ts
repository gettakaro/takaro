import { ITakaroQuery } from '@takaro/db';
import { adminAuthMiddleware } from '@takaro/http';
import {
  DomainCreateInputDTO,
  DomainCreateOutputDTO,
  DomainOutputDTO,
  DomainService,
  DomainUpdateInputDTO,
  DOMAIN_STATES,
} from '../service/DomainService.js';
import { apiResponse, APIOutput } from '@takaro/http';
import { OpenAPI } from 'routing-controllers-openapi';

import { Param, Body, Get, Post, Put, Delete, JsonController, UseBefore, Req, Res } from 'routing-controllers';

import { ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Request, Response } from 'express';
import { TokenOutputDTO, TokenInputDTO, AuthService } from '../service/AuthService.js';

export class DomainCreateOutputDTOAPI extends APIOutput<DomainCreateOutputDTO> {
  @Type(() => DomainCreateOutputDTO)
  @ValidateNested()
  declare data: DomainCreateOutputDTO;
}

export class DomainOutputDTOAPI extends APIOutput<DomainOutputDTO> {
  @Type(() => DomainOutputDTO)
  @ValidateNested()
  declare data: DomainOutputDTO;
}

export class DomainOutputArrayDTOAPI extends APIOutput<DomainOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => DomainOutputDTO)
  declare data: DomainOutputDTO[];
}

export class DomainSearchInputAllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsEnum(Object.values(DOMAIN_STATES), { each: true })
  state!: DOMAIN_STATES[];
}

export class DomainSearchInputDTO extends ITakaroQuery<DomainOutputDTO> {
  @ValidateNested()
  @Type(() => DomainSearchInputAllowedFilters)
  declare filters: DomainSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => DomainSearchInputAllowedFilters)
  declare search: DomainSearchInputAllowedFilters;
}
export class TokenOutputDTOAPI extends APIOutput<TokenOutputDTO> {
  @Type(() => TokenOutputDTO)
  @ValidateNested()
  declare data: TokenOutputDTO;
}

@OpenAPI({
  security: [{ adminAuth: [] }],
})
@UseBefore(adminAuthMiddleware)
@JsonController()
export class DomainController {
  @Post('/domain/search')
  @ResponseSchema(DomainOutputArrayDTOAPI)
  async search(@Req() req: Request, @Res() res: Response, @Body() query: DomainSearchInputDTO) {
    const service = new DomainService();
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
  @Get('/domain/:id')
  @ResponseSchema(DomainOutputDTOAPI)
  async getOne(@Param('id') id: string) {
    const service = new DomainService();
    return apiResponse(await service.findOne(id));
  }

  @Post('/domain')
  @ResponseSchema(DomainCreateOutputDTOAPI)
  async create(@Body() domain: DomainCreateInputDTO) {
    const service = new DomainService();
    return apiResponse(await service.initDomain(domain));
  }

  @Put('/domain/:id')
  @ResponseSchema(DomainOutputDTOAPI)
  async update(@Param('id') id: string, @Body() domain: DomainUpdateInputDTO) {
    const service = new DomainService();
    return apiResponse(await service.update(id, domain));
  }

  @Delete('/domain/:id')
  @ResponseSchema(APIOutput)
  async remove(@Param('id') id: string) {
    const service = new DomainService();
    await service.delete(id);
    return apiResponse();
  }

  @Post('/token')
  @ResponseSchema(TokenOutputDTOAPI)
  async getToken(@Body() body: TokenInputDTO) {
    const authService = new AuthService(body.domainId);
    return apiResponse(await authService.getAgentToken());
  }
}
