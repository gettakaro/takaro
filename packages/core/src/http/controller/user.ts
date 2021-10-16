import { Context } from 'koa';
import { request, responsesAll, summary, tagsAll } from 'koa-swagger-decorator';
import { getManager, Repository } from 'typeorm';

import { User } from '../../database/entity/user.entity';
import { UserRepository } from '../../database/entity/user.repository';

@responsesAll({ 200: { description: 'success' }, 400: { description: 'bad request' }, 401: { description: 'unauthorized, missing/wrong jwt token' } })
@tagsAll(['User'])
export default class UserController {

    @request('get', '/users')
    @summary('Find all users')
    public static async getUsers(ctx: Context): Promise<void> {
        console.log(ctx.state.user);
        
        // get a user repository to perform operations with user
        const userRepository: Repository<User> = getManager().getCustomRepository(UserRepository);

        // load all users
        const users: User[] = await userRepository.find();

        // return OK status code and loaded users array
        ctx.status = 200;
        ctx.body = users;
    }
}
