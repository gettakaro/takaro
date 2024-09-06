import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { Client, RoleOutputDTO } from '@takaro/apiclient';
import { PERMISSIONS } from '@takaro/auth';
import { AxiosError } from 'axios';
import { faker } from '@faker-js/faker';

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

async function multiRolesSetup(client: Client) {
  // Create 5 users
  await Promise.all(
    Array.from({ length: 5 }).map(
      async (_, i) =>
        (
          await client.user.userControllerCreate({
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: `User ${i}`,
          })
        ).data.data,
    ),
  );

  const users = (await client.user.userControllerSearch({ sortBy: 'name', sortDirection: 'asc' })).data.data;

  const permissions1 = await client.permissionCodesToInputs([PERMISSIONS.MANAGE_ROLES]);
  const permissions2 = await client.permissionCodesToInputs([PERMISSIONS.MANAGE_USERS]);
  const role1 = (
    await client.role.roleControllerCreate({
      name: 'Test role 1',
      permissions: permissions1,
    })
  ).data.data;
  const role2 = (
    await client.role.roleControllerCreate({
      name: 'Test role 2',
      permissions: permissions2,
    })
  ).data.data;

  return { users, role1, role2 };
}

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
        }
        throw error;
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
        }
        throw error;
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
        }
        throw error;
      }
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Can fetch members of group - players',
    test: async function () {
      const { role1, role2 } = await multiRolesSetup(this.client);

      // Assign the role to the player
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, role1.id);

      // Fetch the members of the role
      const members = (await this.client.role.roleControllerGetMembers(role1.id)).data.data;
      expect(members.players.results).to.have.lengthOf(1);
      expect(members.players.total).to.be.eq(1);
      expect(members.players.results[0].id).to.eq(this.setupData.players[0].id);

      // Fetch members of role2
      const members2 = (await this.client.role.roleControllerGetMembers(role2.id)).data.data;
      expect(members2.players.results).to.have.lengthOf(0);
      expect(members2.players.total).to.be.eq(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Can fetch members of group - users',
    test: async function () {
      const { users, role1, role2 } = await multiRolesSetup(this.client);

      // Assign the role to the user
      await this.client.user.userControllerAssignRole(users[0].id, role1.id);

      // Fetch the members of the role
      const members = (await this.client.role.roleControllerGetMembers(role1.id)).data.data;
      expect(members.users.results).to.have.lengthOf(1);
      expect(members.users.total).to.be.eq(1);
      expect(members.users.results[0].id).to.eq(users[0].id);

      // Fetch members of role2
      const members2 = (await this.client.role.roleControllerGetMembers(role2.id)).data.data;
      expect(members2.users.results).to.have.lengthOf(0);
      expect(members2.users.total).to.be.eq(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Can fetch members of group - supports pagination',
    test: async function () {
      const { users, role1 } = await multiRolesSetup(this.client);

      // Assign the role to 2 users
      await this.client.user.userControllerAssignRole(users[0].id, role1.id);
      await this.client.user.userControllerAssignRole(users[1].id, role1.id);

      // Fetch first page of users (limit 1)
      const members = (await this.client.role.roleControllerGetMembers(role1.id, 0, 1)).data.data;
      expect(members.users.results).to.have.lengthOf(1);
      expect(members.users.total).to.be.eq(2);
      expect(members.users.results[0].id).to.eq(users[0].id);

      // Fetch second page of users (limit 1)
      const members2 = (await this.client.role.roleControllerGetMembers(role1.id, 1, 1)).data.data;
      expect(members2.users.results).to.have.lengthOf(1);
      expect(members2.users.total).to.be.eq(2);
      expect(members2.users.results[0].id).to.eq(users[1].id);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
