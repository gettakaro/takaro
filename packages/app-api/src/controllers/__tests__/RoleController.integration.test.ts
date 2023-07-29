import { IntegrationTest } from '@takaro/test';
import { RoleOutputDTO } from '@takaro/apiclient';
import { PERMISSIONS } from '@takaro/auth';

const group = 'RoleController';

const tests = [
  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          permissions: [PERMISSIONS.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerGetOne(this.setupData.id);
    },
    filteredFields: ['roleId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get by ID with invalid ID',
    test: async function () {
      return this.client.role.roleControllerGetOne('invalid-id');
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Update by ID',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          permissions: [PERMISSIONS.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerUpdate(this.setupData.id, {
        name: 'New name',
        permissions: [PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_USERS],
      });
    },
    filteredFields: ['roleId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Update by ID with invalid ID',
    test: async function () {
      return this.client.role.roleControllerUpdate('invalid-id', {
        name: 'New name',
        permissions: [PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_USERS],
      });
    },
    expectedStatus: 400,
  }),

  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          permissions: [PERMISSIONS.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerRemove(this.setupData.id);
    },
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Delete with invalid ID',
    test: async function () {
      return this.client.role.roleControllerRemove('invalid-id');
    },
    expectedStatus: 400,
  }),

  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Filter by name',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          permissions: [PERMISSIONS.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerSearch({
        filters: { name: ['Test role'] },
      });
    },
    filteredFields: ['roleId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
