import { db } from './main';
import { faker } from '@faker-js/faker';
import { Domain } from '@prisma/client';

export function MockDomain(domain: Partial<Domain> = {}) {
  return db.domain.create({
    data: {
      name: faker.name.findName(),
      ...domain,
    },
  });
}
