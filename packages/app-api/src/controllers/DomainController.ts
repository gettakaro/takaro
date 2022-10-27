import { ITakaroQuery } from '@takaro/db';
import { config } from '../config';
import {
  DomainCreateInputDTO,
  DomainCreateOutputDTO,
  DomainOutputDTO,
  DomainService,
  DomainUpdateInputDTO,
} from '../service/DomainService';
import {
  createAdminAuthMiddleware,
  apiResponse,
  APIOutput,
  PaginatedRequest,
} from '@takaro/http';
import { OpenAPI } from 'routing-controllers-openapi';

import {
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  JsonController,
  UseBefore,
  Req,
} from 'routing-controllers';

import { ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class DomainCreateOutputDTOAPI extends APIOutput<DomainCreateOutputDTO> {
  @Type(() => DomainCreateOutputDTO)
  @ValidateNested()
  data!: DomainCreateOutputDTO;
}

export class DomainOutputDTOAPI extends APIOutput<DomainOutputDTO> {
  @Type(() => DomainOutputDTO)
  @ValidateNested()
  data!: DomainOutputDTO;
}

export class DomainOutputArrayDTOAPI extends APIOutput<DomainOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => DomainOutputDTO)
  data!: DomainOutputDTO[];
}

export class DomainSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

export class DomainSearchInputDTO extends ITakaroQuery<DomainOutputDTO> {
  @ValidateNested()
  @Type(() => DomainSearchInputAllowedFilters)
  filters!: DomainSearchInputAllowedFilters;
}

@OpenAPI({
  security: [{ adminAuth: [] }],
})
@UseBefore(createAdminAuthMiddleware(config.get('auth.adminSecret')))
@JsonController()
export class DomainController {
  @Post('/domain/search')
  @ResponseSchema(DomainOutputArrayDTOAPI)
  async search(
    @Req() req: PaginatedRequest,
    @Body() query: DomainSearchInputDTO
  ) {
    const service = new DomainService();
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
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
  async create(@Body() domain: Omit<DomainCreateInputDTO, 'id'>) {
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
}
