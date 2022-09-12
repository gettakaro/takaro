import { ITakaroQuery } from '@takaro/db';
import { config } from '../config';
import {
  DomainCreateInputDTO,
  DomainCreateOutputDTO,
  DomainOutputDTO,
  DomainService,
} from '../service/DomainService';
import {
  createAdminAuthMiddleware,
  apiResponse,
  APIOutput,
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
} from 'routing-controllers';
import { DomainModel } from '../db/domain';

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

export class DomainSearchInputDTO extends ITakaroQuery<DomainModel> {
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
  async search(@Body() query: DomainSearchInputDTO) {
    const service = new DomainService();
    return apiResponse(await service.find(query));
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
  async update(@Param('id') id: string, @Body() domain: DomainCreateInputDTO) {
    const service = new DomainService();
    return apiResponse(await service.update(id, domain));
  }

  @Delete('/domain/:id')
  @ResponseSchema(APIOutput)
  async remove(@Param('id') id: string) {
    const service = new DomainService();
    await service.removeDomain(id);
    return apiResponse();
  }
}
