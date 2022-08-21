import { CAPABILITIES, Domain, Role, User } from '@prisma/client';
import { db, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { UserService } from './UserService';
import { randomBytes } from 'crypto';
import { RoleService } from './RoleService';

export class DomainService {
  async get(query: Partial<ITakaroQuery<Domain>>): Promise<Domain[]> {
    const params = new QueryBuilder<Domain>(null, query).build();
    return db.domain.findMany(params);
  }

  async getOne(id: string): Promise<Domain> {
    const params = new QueryBuilder<Domain>(null, { filters: { id } }).build();
    return db.domain.findFirstOrThrow(params);
  }

  async create(input: { name: string }): Promise<{
    domain: Domain;
    rootUser: User;
    rootRole: Role;
    password: string;
  }> {
    const domain = await db.domain.create({ data: input });

    const userService = new UserService(domain.id);
    const roleService = new RoleService(domain.id);

    const rootRole = await roleService.create({
      name: 'root',
      capabilities: [CAPABILITIES.ROOT],
    });

    const password = randomBytes(20).toString('hex');
    const rootUser = await userService.create({
      name: 'root',
      password: password,
      email: `root@${input.name}`,
      roles: [rootRole.id],
    });

    return { domain, rootUser, rootRole, password };
  }

  async update(id: string, domain: Partial<Domain>): Promise<Domain> {
    return db.domain.update({
      where: { id },
      data: domain,
    });
  }

  async delete(id: string): Promise<Domain> {
    return db.domain.delete({ where: { id } });
  }
}
