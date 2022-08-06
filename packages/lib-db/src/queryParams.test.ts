import { MockUser } from './mockModels.test';
import { QueryBuilder } from './queryParams';
import { expect } from '@takaro/test';
import { db } from './main';

describe('Query builder', () => {
  it('Can create a simple exact filter query', async () => {
    const user = await MockUser();

    const query = new QueryBuilder({
      filters: {
        id: user.id,
      },
    });

    const params = query.build();

    const foundUser = await db.user.findMany({ where: params.filters });

    expect(foundUser).to.deep.equal([user]);
  });
});
