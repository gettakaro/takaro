import { disconnectKnex, getKnex } from '../knex';
import { QueryBuilder, SortDirection } from '../queryBuilder';
import { expect } from '@takaro/test';
import { TakaroModel } from '../TakaroModel';
import { Model } from 'objection';

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
      filters: { name: 'test2' },
    }).build(TestUserModel.query());

    expect(res.results).to.have.lengthOf(1);
    expect(res.results[0].name).to.equal('test2');
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
});
