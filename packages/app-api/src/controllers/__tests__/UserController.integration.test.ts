import { IntegrationTest, expect, integrationConfig, SetupGameServerPlayers } from '@takaro/test';
import { PERMISSIONS } from '@takaro/auth';
import { Client, UserOutputDTO } from '@takaro/apiclient';
import { faker } from '@faker-js/faker';

const group = 'UserController';

interface IUserSetup {
  user: UserOutputDTO;
}

const userSetup = async function (this: IntegrationTest<IUserSetup>) {
  const user = await this.client.user.userControllerCreate({
    name: 'Test user',
    idpId: 'test',
    email: 'testUser@example.com',
    password: 'test',
  });
  return { user: user.data.data };
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
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Can assign an expiring role to a user',
    setup: userSetup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      const assignRes = await this.client.user.userControllerAssignRole(this.setupData.user.id, role.data.data.id, {
        expiresAt,
      });

      const userRes = await this.client.user.userControllerGetOne(this.setupData.user.id);
      expect(userRes.data.data.roles[0].expiresAt).to.be.eq(expiresAt);

      return assignRes;
    },
  }),
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Expired roles get deleted',
    setup: userSetup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const expiresAt = new Date(Date.now() - 10).toISOString();
      await this.client.user.userControllerAssignRole(this.setupData.user.id, role.data.data.id, {
        expiresAt,
      });

      const userRes = await this.client.user.userControllerGetOne(this.setupData.user.id);
      expect(userRes.data.data.roles.find((assignment) => assignment.role.name === 'Test role')).to.be.undefined;

      return userRes;
    },
    filteredFields: ['idpId', 'roleId', 'userId', 'lastSeen'],
  }),
  // Repro for https://github.com/gettakaro/takaro/issues/1013
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Inviting a user that is already invited should return the existing user',
    setup: userSetup,
    test: async function () {
      const email = faker.internet.email();
      await this.client.user.userControllerInvite({
        email,
      });

      const res = await this.client.user.userControllerInvite({
        email,
      });

      return res;
    },
    filteredFields: ['idpId', 'roleId', 'userId', 'lastSeen', 'email', 'name'],
  }),
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Inviting a user that already exists in a different domain should work transparently',
    setup: userSetup,
    test: async function () {
      const email = faker.internet.email();
      await this.client.user.userControllerInvite({
        email,
      });

      const domain2 = await this.adminClient.domain.domainControllerCreate({
        name: 'integration-test-domain-2',
      });

      const client2 = new Client({
        auth: {
          username: domain2.data.data.rootUser.email,
          password: domain2.data.data.password,
        },
        url: integrationConfig.get('host'),
      });

      await client2.login();

      const res = await client2.user.userControllerInvite({
        email,
      });

      return res;
    },
    filteredFields: ['idpId', 'roleId', 'userId', 'lastSeen', 'email', 'name'],
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
      const members1 = (await this.client.user.userControllerSearch({ filters: { roleId: [role1.id] } })).data.data;
      expect(members1).to.have.lengthOf(1);

      // Fetch members of role2
      const members2 = (await this.client.user.userControllerSearch({ filters: { roleId: [role2.id] } })).data.data;
      expect(members2).to.have.lengthOf(0);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
