import { IntegrationTest } from '@takaro/test';
import { CAPABILITIES } from '../db/role';
import { RoleOutputDTO } from '../service/RoleService';

const group = 'RoleController';

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<RoleOutputDTO>({
    group,
    name: 'Get by ID',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          capabilities: [CAPABILITIES.MANAGE_ROLES],
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
    name: 'Get by ID with invalid ID',
    test: async function () {
      return this.client.role.roleControllerGetOne('invalid-id');
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<RoleOutputDTO>({
    group,
    name: 'Update by ID',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          capabilities: [CAPABILITIES.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerUpdate(this.setupData.id, {
        name: 'New name',
        capabilities: [CAPABILITIES.MANAGE_ROLES, CAPABILITIES.MANAGE_USERS],
      });
    },
    filteredFields: ['roleId'],
  }),
  new IntegrationTest<void>({
    group,
    name: 'Update by ID with invalid ID',
    test: async function () {
      return this.client.role.roleControllerUpdate('invalid-id', {
        name: 'New name',
        capabilities: [CAPABILITIES.MANAGE_ROLES, CAPABILITIES.MANAGE_USERS],
      });
    },
    expectedStatus: 400,
  }),

  new IntegrationTest<RoleOutputDTO>({
    group,
    name: 'Delete',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          capabilities: [CAPABILITIES.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerRemove(this.setupData.id);
    },
  }),

  new IntegrationTest<void>({
    group,
    name: 'Delete with invalid ID',
    test: async function () {
      return this.client.role.roleControllerRemove('invalid-id');
    },
    expectedStatus: 400,
  }),

  new IntegrationTest<RoleOutputDTO>({
    group,
    name: 'Filter by name',
    setup: async function () {
      return (
        await this.client.role.roleControllerCreate({
          name: 'Test role',
          capabilities: [CAPABILITIES.MANAGE_ROLES],
        })
      ).data.data;
    },
    test: async function () {
      return this.client.role.roleControllerSearch({
        filters: { name: 'Test role' },
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
