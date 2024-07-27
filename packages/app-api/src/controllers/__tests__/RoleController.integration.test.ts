import { IntegrationTest, expect } from '@takaro/test';
import { RoleOutputDTO } from '@takaro/apiclient';
import { PERMISSIONS } from '@takaro/auth';
import { AxiosError } from 'axios';

const group = 'RoleController';

const setup = async function (this: IntegrationTest<RoleOutputDTO>) {
  const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_ROLES]);
  return (
    await this.client.role.roleControllerCreate({
      name: 'Test role',
      permissions,
    })
  ).data.data;
};

const tests = [
  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup,
    test: async function () {
      return this.client.role.roleControllerGetOne(this.setupData.id);
    },
    filteredFields: ['roleId', 'permissionId'],
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
    setup,
    test: async function () {
      return this.client.role.roleControllerUpdate(this.setupData.id, {
        name: 'New name',
        permissions: await this.client.permissionCodesToInputs(
          this.setupData.permissions.map((p) => p.permission.permission),
        ),
      });
    },
    filteredFields: ['roleId', 'permissionId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Update by ID with invalid ID',
    test: async function () {
      return this.client.role.roleControllerUpdate('invalid-id', {
        name: 'New name',
        permissions: [],
      });
    },
    expectedStatus: 400,
  }),

  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup,
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
    setup,
    test: async function () {
      return this.client.role.roleControllerSearch({
        filters: { name: ['Test role'] },
      });
    },
    filteredFields: ['roleId', 'permissionId'],
  }),
  new IntegrationTest<RoleOutputDTO>({
    group,
    snapshot: true,
    name: 'Update permissions with empty array',
    setup,
    test: async function () {
      await this.client.role.roleControllerUpdate(this.setupData.id, {
        name: 'New name',
        permissions: [],
      });

      const newRoleRes = await this.client.role.roleControllerGetOne(this.setupData.id);
      expect(newRoleRes.data.data.permissions).to.deep.eq([]);

      return newRoleRes;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Does not allow deleting the root role',
    test: async function () {
      try {
        const rolesRes = await this.client.role.roleControllerSearch({ filters: { name: ['root'] } });
        await this.client.role.roleControllerRemove(rolesRes.data.data[0].id);
        throw new Error('Should have errored');
      } catch (error) {
        if (error instanceof AxiosError) {
          expect(error.response?.status).to.eq(400);
          expect(error.response?.data.meta.error.message).to.be.eq('Cannot delete system roles');
          return error.response;
        } else {
          throw error;
        }
      }
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Cannot create root role if it already exists',
    test: async function () {
      try {
        await this.client.role.roleControllerCreate({
          name: 'root',
          permissions: [],
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (error instanceof AxiosError) {
          expect(error.response?.status).to.eq(409);
          expect(error.response?.data.meta.error.message).to.be.eq('Unique constraint violation');
          return error.response;
        } else {
          throw error;
        }
      }
    },
    expectedStatus: 409,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Cannot update root role',
    test: async function () {
      try {
        const rolesRes = await this.client.role.roleControllerSearch({ filters: { name: ['root'] } });
        await this.client.role.roleControllerUpdate(rolesRes.data.data[0].id, {
          name: 'New name',
          permissions: [],
        });
        throw new Error('Should have errored');
      } catch (error) {
        if (error instanceof AxiosError) {
          expect(error.response?.status).to.eq(400);
          expect(error.response?.data.meta.error.message).to.be.eq('Cannot update root role');
          return error.response;
        } else {
          throw error;
        }
      }
    },
    expectedStatus: 400,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
