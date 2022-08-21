import { Prisma, User } from '@prisma/client';
import { db, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, logger } from '@takaro/logger';
import { DomainScoped } from '../lib/DomainScoped';
import { genSalt, hash } from 'bcrypt';
import { config } from '../config';
import { CreateUserDTO } from '../controllers/UserController';

type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

export class UserService extends DomainScoped {
  static log = logger(this.name);
  async get(query: Partial<ITakaroQuery<User>>): Promise<User[]> {
    const params = new QueryBuilder<User>(this.domainId, query).build();
    return db.user.findMany(params);
  }

  async getOne(id: string): Promise<UserWithRoles> {
    const params = new QueryBuilder<User>(this.domainId, {
      filters: { id },
    }).build();
    return db.user.findFirstOrThrow({
      ...params,
      include: { roles: { include: { role: true } } },
    });
  }

  async create(user: CreateUserDTO & { roles?: string[] }): Promise<User> {
    const salt = await genSalt(config.get('auth.saltRounds'));
    const passwordHash = await hash(user.password, salt);

    return db.user.create({
      data: {
        passwordHash,
        name: user.name,
        email: user.email,
        roles: {
          create: user.roles
            ? user.roles.map((roleId) => ({ roleId }))
            : undefined,
        },
        domainId: this.domainId,
      },
    });
  }

  async update(id: string, user: Prisma.UserUpdateInput): Promise<User> {
    return db.user.update({
      where: { id },
      data: user,
    });
  }

  async delete(id: string): Promise<User> {
    const { where } = new QueryBuilder<User>(this.domainId, {
      filters: { id },
    }).build();
    return db.user.delete({ where });
  }

  static async getDomainId(email?: string, id?: string): Promise<string> {
    const user = await db.user.findFirst({
      where: { OR: { email, id } },
      select: { domainId: true },
    });
    if (!user) {
      UserService.log.warn(
        `User with email ${email} or ID ${id} not found in any domain`
      );
      throw new errors.UnauthorizedError();
    }
    return user.domainId;
  }
}
