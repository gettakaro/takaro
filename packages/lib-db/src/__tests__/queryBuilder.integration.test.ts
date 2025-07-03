import { disconnectKnex, getKnex } from '../knex.js';
import { populateModelColumns, QueryBuilder, SortDirection } from '../queryBuilder.js';
import { expect } from '@takaro/test';
import { TakaroModel } from '../TakaroModel.js';
import { Model } from 'objection';
import { sleep } from '@takaro/util';
import { describe, beforeEach, afterEach, it } from 'node:test';

const TEST_TABLE_USERS_NAME = 'test_users';
const TEST_TABLE_POSTS_NAME = 'test_posts';

class TestPostModel extends TakaroModel {
  static tableName = TEST_TABLE_POSTS_NAME;
  title!: string;
  userId!: string;

  static relationMappings = {
    author: {
      relation: Model.HasOneRelation,
      modelClass: () => TestUserModel,
      join: {
        from: `${TEST_TABLE_POSTS_NAME}.userId`,
        to: `${TEST_TABLE_USERS_NAME}.id`,
      },
    },
  };
}

class TestUserModel extends TakaroModel {
  static tableName = TEST_TABLE_USERS_NAME;
  name!: string;

  static relationMappings = {
    posts: {
      relation: Model.HasManyRelation,
      modelClass: TestPostModel,
      join: {
        from: `${TEST_TABLE_USERS_NAME}.id`,
        to: `${TEST_TABLE_POSTS_NAME}.userId`,
      },
    },
  };
}

describe('QueryBuilder', () => {
  beforeEach(async () => {
    const knex = await getKnex();
    await knex.schema.dropTableIfExists(TEST_TABLE_USERS_NAME);
    await knex.schema.dropTableIfExists(TEST_TABLE_POSTS_NAME);
    await knex.schema.createTable(TEST_TABLE_USERS_NAME, (table) => {
      table.timestamps(true, true, true);
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
      table.string('name');
    });
    await knex.schema.createTable(TEST_TABLE_POSTS_NAME, (table) => {
      table.timestamps(true, true, true);
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
      table.string('title');
      table.uuid('userId');
    });

    TestUserModel.knex(knex);
    TestPostModel.knex(knex);

    await populateModelColumns();
  });

  afterEach(async () => {
    const knex = await getKnex();
    await knex.schema.dropTableIfExists(TEST_TABLE_USERS_NAME);
    await disconnectKnex();
  });

  it('Can create basic filters', async () => {
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      filters: { name: ['test2'] },
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(1);
    expect(res.results[0].name).to.equal('test2');
  });

  it('Can filter based on multiple values', async () => {
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      filters: { name: ['test2', 'test3'] },
      sortBy: 'name',
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(2);
    expect(res.results[0].name).to.equal('test2');
    expect(res.results[1].name).to.equal('test3');
  });

  it('Can do paging', async () => {
    const totalTestRecords = 100;

    for (let i = 0; i < totalTestRecords; i++) {
      const number = i.toString().padStart(3, '0');
      await TestUserModel.query().insert({ name: `test${number}` });
    }

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      page: 2,
      limit: 10,
      sortBy: 'name',
      sortDirection: SortDirection.asc,
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(10);
    expect(res.results[0].name).to.equal('test020');
    expect(res.total).to.equal(totalTestRecords);
  });

  it('Can do sorting', async () => {
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      sortBy: 'name',
      sortDirection: SortDirection.desc,
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(3);
    expect(res.results[0].name).to.equal('test3');
  });

  it('Can do extending', async () => {
    const user = await TestUserModel.query().insert({ name: 'test1' });
    await TestPostModel.query().insert({ title: 'test1', userId: user.id });

    const res = await new QueryBuilder<
      TestPostModel & { author?: TestUserModel },
      TestPostModel & { author?: TestUserModel }
    >({ extend: ['author'] }).build(TestPostModel.query());

    expect(res.results).to.have.lengthOf(1);
    expect(res.results[0].author?.name).to.equal('test1');
  });

  it('Can do partial matching of strings', async () => {
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      search: {
        name: ['test'],
      },
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(3);

    const res2 = await new QueryBuilder<TestUserModel, TestUserModel>({
      search: {
        name: ['1'],
      },
    }).build(TestUserModel.query());

    expect(res2.results).to.have.lengthOf(1);
  });

  it('Can search for multiple values, ORs them', async () => {
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      search: {
        name: ['st1', 'st2'],
      },
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(2);
  });

  it('Can search between a date range', async () => {
    const start = new Date();
    await TestUserModel.query().insert({ name: 'test1' });
    await TestUserModel.query().insert({ name: 'test2' });
    const end = new Date();

    // Quick hack to make the test pass
    // Relying on times like this with an external DB is troublesome...
    await sleep(250);

    await TestUserModel.query().insert({ name: 'test3' });

    const res = await new QueryBuilder<TestUserModel, TestUserModel>({
      greaterThan: {
        createdAt: start.toISOString(),
      },
      lessThan: {
        createdAt: end.toISOString(),
      },
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(2);
  });
});
