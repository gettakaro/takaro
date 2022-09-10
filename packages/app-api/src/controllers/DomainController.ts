import { ITakaroQuery } from '@takaro/db';
import { config } from '../config';
import { CreateDomainDTO, DomainService } from '../service/DomainService';
import { createAdminAuthMiddleware, apiResponse } from '@takaro/http';

import {
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  JsonController,
  UseBefore,
  QueryParams,
} from 'routing-controllers';
import { DomainModel } from '../db/domain';

@UseBefore(createAdminAuthMiddleware(config.get('auth.adminSecret')))
@JsonController()
export class DomainController {
  @Get('/domain')
  async getAll(@QueryParams() query: ITakaroQuery<DomainModel>) {
    const service = new DomainService();
    return apiResponse(await service.find(query));
  }

  @Get('/domain/:id')
  async getOne(@Param('id') id: string) {
    const service = new DomainService();
    return apiResponse(await service.findOne(id));
  }

  @Post('/domain')
  async post(@Body() domain: CreateDomainDTO) {
    const service = new DomainService();
    return apiResponse(await service.initDomain(domain));
  }

  @Put('/domain/:id')
  async put(@Param('id') id: string, @Body() domain: CreateDomainDTO) {
    const service = new DomainService();
    return apiResponse(await service.update(id, domain));
  }

  @Delete('/domain/:id')
  async remove(@Param('id') id: string) {
    const service = new DomainService();
    await service.removeDomain(id);
    return apiResponse();
  }
}
