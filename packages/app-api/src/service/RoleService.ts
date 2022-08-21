import { Role } from '@prisma/client';
import { db, ITakaroQuery, QueryBuilder } from '@takaro/db';
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
    return db.role.update({
      where: { id },
      data: role,
    });
  }

  async delete(id: string): Promise<void> {
    await db.role.delete({ where: { id } });
  }
}
