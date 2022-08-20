import { Domain } from '@prisma/client';
import { db, ITakaroQuery, QueryBuilder } from '@takaro/db';

export class DomainService {
  async get(query: Partial<ITakaroQuery<Domain>>): Promise<Domain[]> {
    const params = new QueryBuilder<Domain>(query).build();
    return db.domain.findMany(params);
  }

  async getOne(id: string): Promise<Domain> {
    return db.domain.findFirstOrThrow({
      where: { id: { equals: id } },
    });
  }

  async create(domain: { name: string }): Promise<Domain> {
    return db.domain.create({ data: domain });
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
