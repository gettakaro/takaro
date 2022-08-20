import { Length } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { config } from '../config';
import { DomainService } from '../service/DomainService';
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

export class DomainDTO {
  @Length(3, 20)
  name!: string;
}

@UseBefore(createAdminAuthMiddleware(config.get('auth.adminSecret')))
@JsonController()
export class DomainController {
  @Get('/domain')
  async getAll(@QueryParams() query: ITakaroQuery<DomainDTO>) {
    const service = new DomainService();
    return apiResponse(await service.get(query));
  }

  @Get('/domain/:id')
  async getOne(@Param('id') id: string) {
    const service = new DomainService();
    return apiResponse(await service.getOne(id));
  }

  @Post('/domain')
  async post(@Body() domain: DomainDTO) {
    const service = new DomainService();
    return apiResponse(await service.create(domain));
  }

  @Put('/domain/:id')
  async put(@Param('id') id: string, @Body() domain: DomainDTO) {
    const service = new DomainService();
    return apiResponse(await service.update(id, domain));
  }

  @Delete('/domain/:id')
  async remove(@Param('id') id: string) {
    const service = new DomainService();
    return apiResponse(await service.delete(id));
  }
}
