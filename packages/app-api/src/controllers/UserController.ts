import { IsEmail, Length } from 'class-validator';
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

export class UserDTO {
  @Length(3, 20)
  name!: string;

  @IsEmail()
  email!: string;
}

@JsonController()
export class UserController {
  @Get('/users')
  async getAll() {
    const users = await db.user.findMany();
    return users;
  }

  @Get('/users/:id')
  async getOne(@Param('id') id: number) {
    const user = await db.user.findFirstOrThrow({
      where: { id: { equals: id } },
    });
    return user;
  }

  @Post('/users')
  async post(@Body() user: UserDTO) {
    const createdUser = await db.user.create({ data: user });
    return createdUser;
  }

  @Put('/users/:id')
  async put(@Param('id') id: number, @Body() user: UserDTO) {
    const updatedUser = await db.user.update({ where: { id }, data: user });
    return updatedUser;
  }

  @Delete('/users/:id')
  async remove(@Param('id') id: number) {
    const deletedUser = await db.user.delete({ where: { id } });
    return deletedUser;
  }
}
