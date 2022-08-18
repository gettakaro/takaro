import { Length } from 'class-validator';
import { db } from '@takaro/db';
import { config } from '../config';
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
} from 'routing-controllers';

export class DomainDTO {
  @Length(3, 20)
  name!: string;
}

@UseBefore(createAdminAuthMiddleware(config.get('auth.adminSecret')))
@JsonController()
export class DomainController {
  @Get('/domain')
  async getAll() {
    const domains = await db.domain.findMany();
    return apiResponse(domains);
  }

  @Get('/domain/:id')
  async getOne(@Param('id') id: string) {
    const domain = await db.domain.findFirstOrThrow({
      where: { id: { equals: id } },
    });
    return apiResponse(domain);
  }

  @Post('/domain')
  async post(@Body() domain: DomainDTO) {
    const createdDomain = await db.domain.create({ data: domain });
    return apiResponse(createdDomain);
  }

  @Put('/domain/:id')
  async put(@Param('id') id: string, @Body() domain: DomainDTO) {
    const updatedDomain = await db.domain.update({
      where: { id },
      data: domain,
    });
    return apiResponse(updatedDomain);
  }

  @Delete('/domain/:id')
  async remove(@Param('id') id: string) {
    const deletedDomain = await db.domain.delete({ where: { id } });
    return apiResponse(deletedDomain);
  }
}
