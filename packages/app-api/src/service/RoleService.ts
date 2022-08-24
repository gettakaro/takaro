import { Role } from '@prisma/client';
import { db, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/logger';
import { CreateRoleDTO, UpdateRoleDTO } from '../controllers/Rolecontroller';
import { DomainScoped } from '../lib/DomainScoped';

export class RoleService extends DomainScoped {
  async get(query: Partial<ITakaroQuery<Role>>): Promise<Role[]> {
    const params = new QueryBuilder<Role>(this.domainId, query).build();
    return db.role.findMany(params);
  }

  async getOne(id: string): Promise<Role> {
    const { where } = new QueryBuilder<Role>(this.domainId, {
      filters: { id },
    }).build();

    return db.role.findFirstOrThrow({
      where,
    });
  }

  async create(role: CreateRoleDTO): Promise<Role> {
    return db.role.create({
      data: {
        name: role.name,
        capabilities: role.capabilities,
        domainId: this.domainId,
      },
    });
  }

  async update(id: string, role: UpdateRoleDTO): Promise<Role> {
    const { where } = new QueryBuilder<Role>(this.domainId, {
      filters: { id },
    }).build();

    await db.role.updateMany({
      where,
      data: role,
    });

    return this.getOne(id);
  }

  async delete(id: string): Promise<void> {
    const { where } = new QueryBuilder<Role>(this.domainId, {
      filters: { id },
    }).build(null);

    const res = await db.role.deleteMany({ where });

    if (res.count === 0) {
      throw new errors.NotFoundError();
    }
  }
}
