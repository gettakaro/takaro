import { Length } from 'class-validator';
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
  username!: string;
}

@JsonController()
export class UserController {
  @Get('/users')
  getAll() {
    return 'This action returns all users';
  }

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return 'This action returns user #' + id;
  }

  @Post('/users')
  post(@Body() user: UserDTO) {
    return user;
  }

  @Put('/users/:id')
  put(@Param('id') id: number, @Body() user: UserDTO) {
    return {
      id,
      ...user,
    };
  }

  @Delete('/users/:id')
  remove(@Param('id') id: number) {
    return { id };
  }
}
