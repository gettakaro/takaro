import { IntegrationTest, expect, integrationConfig, SetupGameServerPlayers } from '@takaro/test';
import { PERMISSIONS } from '@takaro/auth';
import { Client, UserOutputDTO } from '@takaro/apiclient';
import { faker } from '@faker-js/faker';
import { AxiosError, isAxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { describe } from 'node:test';

const group = 'UserController';

interface IUserSetup {
  user: UserOutputDTO;
  userClient: Client;
}

const userSetup = async function (this: IntegrationTest<IUserSetup>) {
  const password = faker.internet.password();
  const user = await this.client.user.userControllerCreate({
    name: 'Test user',
    email: `test-${faker.internet.email()}`,
    password,
  });

  const userClient = new Client({
    auth: { username: user.data.data.email, password },
    url: integrationConfig.get('host'),
  });
  await userClient.login();

  return { user: user.data.data, userClient };
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
    filteredFields: ['idpId', 'roleId', 'userId', 'lastSeen', 'email'],
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
        maxUsers: 5,
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
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Can fetch members of group - player system role returns all players',
    test: async function () {
      const { users } = await multiRolesSetup(this.client);
      const role = await this.client.role.roleControllerSearch({ filters: { name: ['Player'] } });
      const members = (await this.client.user.userControllerSearch({ filters: { roleId: [role.data.data[0].id] } }))
        .data.data;
      expect(members.length).to.be.eq(users.length);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Can fetch members of group - user system role returns all players',
    test: async function () {
      const { users } = await multiRolesSetup(this.client);
      const role = await this.client.role.roleControllerSearch({ filters: { name: ['User'] } });
      const members = (await this.client.user.userControllerSearch({ filters: { roleId: [role.data.data[0].id] } }))
        .data.data;
      expect(members.length).to.be.eq(users.length);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Does not allow assigning player system role',
    test: async function () {
      const { users } = await multiRolesSetup(this.client);
      const role = await this.client.role.roleControllerSearch({ filters: { name: ['Player'] } });
      const user = users[0];
      try {
        await this.client.user.userControllerAssignRole(user.id, role.data.data[0].id);
        throw new Error('Should have thrown');
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          expect(error.response.data.meta.error.message).to.be.eq(
            'Cannot assign Player or User role, everyone has these by default',
          );
        } else {
          throw error;
        }
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'Does not allow assigning user system role',
    test: async function () {
      const { users } = await multiRolesSetup(this.client);
      const role = await this.client.role.roleControllerSearch({ filters: { name: ['User'] } });
      const user = users[0];

      try {
        await this.client.user.userControllerAssignRole(user.id, role.data.data[0].id);
        throw new Error('Should have thrown');
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          expect(error.response.data.meta.error.message).to.be.eq(
            'Cannot assign Player or User role, everyone has these by default',
          );
        } else {
          throw error;
        }
      }
    },
  }),
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Can delete a user',
    setup: userSetup,
    test: async function () {
      // This is a bug repro, when you delete a user that has events, a FK constraint error is thrown
      const role = (await this.client.role.roleControllerSearch({ filters: { name: ['root'] } })).data.data[0];
      await this.client.user.userControllerAssignRole(this.setupData.user.id, role.id);
      await this.setupData.userClient.module.moduleControllerCreate({
        name: 'blabla',
        latestVersion: { description: 'blabla' },
      });
      // So, let's ensure there's an event for this user
      const events = await this.client.event.eventControllerSearch({
        filters: { actingUserId: [this.setupData.user.id] },
      });
      expect(events.data.data.length).to.be.greaterThan(0, 'No events found for user');

      // Then delete the user
      const res = await this.client.user.userControllerRemove(this.setupData.user.id);
      return res;
    },
  }),
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: false,
    name: 'Cannot create more dashboard users than allowed',
    setup: userSetup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id set');
      const domain = await this.adminClient.domain.domainControllerGetOne(this.standardDomainId);

      const maxUsers = domain.data.data.maxUsers;

      const currentDashboardUsers = await this.client.user.userControllerSearch({
        filters: { isDashboardUser: [true] },
      });
      const currentDashboardUsersCount = currentDashboardUsers.data.meta.total;
      if (currentDashboardUsersCount == undefined) throw new Error('Could not get current dashboard users count');

      // Create the maximum number of dashboard users
      await Promise.all(
        Array.from({ length: maxUsers - currentDashboardUsersCount }).map(async () => {
          const email = faker.internet.email();
          return this.client.user.userControllerCreate({
            email,
            isDashboardUser: true,
            name: randomUUID(),
            password: randomUUID(),
          });
        }),
      );

      // Try to create one more
      try {
        await this.client.user.userControllerCreate({
          email: faker.internet.email(),
          isDashboardUser: true,
          name: randomUUID(),
          password: randomUUID(),
        });
        throw new Error('Should have thrown');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.data.meta.error.message).to.be.eq('Max users (5) limit reached');
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'me endpoint returns the current user',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const meRes = await this.client.user.userControllerMe();
      expect(meRes.data.data.user).to.not.be.undefined;
      expect(meRes.data.data.domain).to.not.be.undefined;
      expect(meRes.data.data.domains).to.be.an('array');
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'me endpoint returns registration token only if user has required permissions',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const fakePassword = randomUUID();
      const fakeEmail = faker.internet.email();
      await this.client.user.userControllerCreate({
        email: fakeEmail,
        password: fakePassword,
        name: faker.internet.userName(),
      });

      const userClient = new Client({
        auth: {
          username: fakeEmail,
          password: fakePassword,
        },
        url: integrationConfig.get('host'),
      });

      await userClient.login();

      const meRes = await userClient.user.userControllerMe();
      for (const domain of meRes.data.data.domains) {
        expect(domain.serverRegistrationToken).to.be.undefined;
      }

      // Assign the user the required permissions
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      await this.client.user.userControllerAssignRole(meRes.data.data.user.id, role.data.data.id);
      const meRes2 = await userClient.user.userControllerMe();
      for (const domain of meRes2.data.data.domains) {
        expect(domain.serverRegistrationToken).to.not.be.undefined;
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
