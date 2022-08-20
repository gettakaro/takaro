import supertest from 'supertest';
import { integrationConfig, snapshot, expect } from '@takaro/test';
import { DANGEROUS_cleanDatabase } from '@takaro/db';
import { MockDomain } from '../test/mockModels';

const tests: snapshot.ITestWithSnapshot[] = [
  {
    name: 'Basic fetch',
    setup: async () => {
      await MockDomain({
        name: 'auto-test',
      });
    },
    url: '/domain',
    method: 'get',
  },
  {
    name: 'Basic fetch with filter',
    setup: async () => {
      await MockDomain({
        name: 'auto-test-filter',
      });
    },
    url: '/domain?filters[name]=auto-test-filter',
    method: 'get',
  },
  {
    name: 'Fetch one',
    setup: async () => {
      await MockDomain({
        id: 'b14957e4-869f-4149-b386-4aef875c777d',
        name: 'auto-test-one',
      });
    },
    url: '/domain/b14957e4-869f-4149-b386-4aef875c777d',
    method: 'get',
  },
  {
    name: 'Basic fetch sort asc',
    setup: async () => {
      await MockDomain({
        name: 'auto-test-filter-sort-aaa',
      });
      await MockDomain({
        name: 'auto-test-filter-sort-bbb',
      });
    },
    url: '/domain?sortBy=name&sortDirection=asc',
    method: 'get',
  },
  {
    name: 'Basic fetch sort desc',
    setup: async () => {
      await MockDomain({
        name: 'auto-test-filter-sort-aaa',
      });
      await MockDomain({
        name: 'auto-test-filter-sort-bbb',
      });
    },
    url: '/domain?sortBy=name&sortDirection=desc',
    method: 'get',
  },
  {
    name: 'Create domain',
    url: '/domain',
    method: 'post',
    body: {
      name: 'auto-test-create',
    },
  },
  {
    name: 'Update domain',
    setup: async () => {
      await MockDomain({
        id: 'b14957e4-869f-4149-b386-4aef875c777d',
        name: 'auto-test-update',
      });
    },
    url: '/domain/b14957e4-869f-4149-b386-4aef875c777d',
    method: 'put',
    body: {
      name: 'auto-test-update',
    },
  },
  {
    name: 'Delete domain',
    setup: async () => {
      await MockDomain({
        id: 'b14957e4-869f-4149-b386-4aef875c777e',
        name: 'auto-test-delete',
      });
    },
    url: '/domain/b14957e4-869f-4149-b386-4aef875c777e',
    method: 'delete',
  },
];

describe('Domain controller', function () {
  beforeEach(async () => {
    await DANGEROUS_cleanDatabase();
  });

  tests.forEach((test) => {
    it(test.name, async function () {
      if (test.setup) {
        await test.setup();
      }

      const req = supertest(integrationConfig.get('host'))
        [test.method](test.url)
        .auth('admin', integrationConfig.get('auth.adminSecret'));

      if (test.body) {
        req.send(test.body);
      }

      const response = await req;

      expect([200, 201]).to.include(response.statusCode);
      await snapshot.matchSnapshot(
        { ...test, name: this.test.fullTitle() },
        response.body
      );
    });
  });
});
