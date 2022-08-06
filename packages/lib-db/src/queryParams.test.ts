import { MockDomain } from './mockModels.test';
import { QueryBuilder } from './queryParams';
import { expect } from '@takaro/test';
import { db } from './main';

describe('Query builder', () => {
  it('Can create a simple exact filter query', async () => {
    const domain = await MockDomain();

    const query = new QueryBuilder({
      filters: {
        id: domain.id,
      },
    });

    const params = query.build();

    const foundUser = await db.domain.findMany({ where: params.filters });

    expect(foundUser).to.deep.equal([domain]);
  });
});
