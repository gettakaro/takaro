import { Length } from 'class-validator';
import { db } from '@takaro/db';

import {
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  JsonController,
} from 'routing-controllers';

export class DomainDTO {
  @Length(3, 20)
  name!: string;
}

@JsonController()
export class DomainController {
  @Get('/domain')
  async getAll() {
    const domains = await db.domain.findMany();
    return domains;
  }

  @Get('/domain/:id')
  async getOne(@Param('id') id: string) {
    const domain = await db.domain.findFirstOrThrow({
      where: { id: { equals: id } },
    });
    return domain;
  }

  @Post('/domain')
  async post(@Body() domain: DomainDTO) {
    const createdDomain = await db.domain.create({ data: domain });
    return createdDomain;
  }

  @Put('/domain/:id')
  async put(@Param('id') id: string, @Body() domain: DomainDTO) {
    const updatedDomain = await db.domain.update({ where: { id }, data: domain });
    return updatedDomain;
  }

  @Delete('/domain/:id')
  async remove(@Param('id') id: string) {
    const deletedDomain = await db.domain.delete({ where: { id } });
    return deletedDomain;
  }
}
