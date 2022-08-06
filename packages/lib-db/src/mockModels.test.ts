import { db, User } from './main';
import { faker } from '@faker-js/faker';

export function MockUser(user: Partial<User> = {}) {
  return db.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.name.findName(),
      ...user,
    },
  });
}
