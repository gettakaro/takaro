import { MockDomain } from './mockModels.test';
import { QueryBuilder, SortDirection } from './queryBuilder';
import { expect } from '@takaro/test';
import { db } from './main';
import { Domain } from '@prisma/client';
import { DANGEROUS_cleanDatabase } from './util';

describe('Query builder', () => {
  beforeEach(async () => {
    await DANGEROUS_cleanDatabase();
  });

  it('Can create a simple exact filter query', async () => {
    const domain = await MockDomain();

    const query = new QueryBuilder<Domain>({
      filters: {
        id: domain.id,
      },
    });

    const params = query.build();

    const foundUser = await db.domain.findMany(params);

    expect(foundUser).to.deep.equal([domain]);
  });

  it('Can create sorting parameters', async () => {
    const domain = await MockDomain({ name: 'aaa' });
    const domain2 = await MockDomain({ name: 'bbb' });

    const query = new QueryBuilder<Domain>({
      sortBy: 'name',
      sortDirection: SortDirection.asc,
    });

    const params = query.build();

    const data = await db.domain.findMany(params);

    expect(data).to.deep.equal([domain, domain2]);

    const query2 = new QueryBuilder<Domain>({
      sortBy: 'name',
      sortDirection: SortDirection.desc,
    });

    const params2 = query2.build();

    const data2 = await db.domain.findMany(params2);

    expect(data2).to.deep.equal([domain2, domain]);
  });
});
