import { database } from '@takaro/shared';
import { Context } from 'koa';
import { request, responsesAll, summary, tagsAll } from 'koa-swagger-decorator';

@responsesAll({
  200: { description: 'success' },
  400: { description: 'bad request' },
  401: { description: 'unauthorized, missing/wrong jwt token' },
})
@tagsAll(['User'])
export default class UserController {
  @request('get', '/users')
  @summary('Find all users')
  public static async getUsers(ctx: Context): Promise<void> {
    console.log(ctx.state.user);
    const users = await database.User.find();

    // return OK status code and loaded users array
    ctx.status = 200;
    ctx.body = users;
  }
}
