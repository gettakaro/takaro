import { IntegrationTest, expect, SetupGameServerPlayers, EventsAwaiter, createUserForPlayer } from '@takaro/test';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { HookCreateDTOEventTypeEnum, PERMISSIONS, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Bug repros';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    setup: SetupGameServerPlayers.setup,
    name: 'When searching module installs, filtering by gameserverId works properly',
    /**
     * Install a module on server A
     * Search for installs on server A -> should return 1 result
     * Then search for installs on server B -> should return 0 results
     */
    test: async function () {
      const module = (await this.client.module.moduleControllerCreate({ name: randomUUID() })).data.data;
      const gameServerA = this.setupData.gameServer1;
      const gameServerB = this.setupData.gameServer2;

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameServerA.id,
        versionId: module.latestVersion.id,
      });

      const installsA = await this.client.module.moduleInstallationsControllerGetInstalledModules({
        filters: { gameserverId: [gameServerA.id] },
      });
      const installsB = await this.client.module.moduleInstallationsControllerGetInstalledModules({
        filters: { gameserverId: [gameServerB.id] },
      });

      expect(installsA.data.data.length).to.equal(1);
      expect(installsB.data.data.length).to.equal(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: can fire a hook based on role-assigned event',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const module = (await this.client.module.moduleControllerCreate({ name: randomUUID() })).data.data;

      await this.client.hook.hookControllerCreate({
        name: 'role-assign test',
        versionId: module.latestVersion.id,
        regex: '',
        eventType: HookCreateDTOEventTypeEnum.RoleAssigned,
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { player } = data;
            await takaro.gameserver.gameServerControllerSendMessage('${this.setupData.gameServer1.id}', {
                message: 'pong',
            });
        }
        await main();`,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer1.id,
        versionId: module.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        HookCreateDTOEventTypeEnum.ChatMessage,
        1,
      );

      const users = await this.client.user.userControllerSearch();
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions: [],
      });

      await this.client.user.userControllerAssignRole(users.data.data[0].id, role.data.data.id);

      // Ensure the role is assigned
      const user = await this.client.user.userControllerGetOne(users.data.data[0].id);
      expect(user.data.data.roles.map((r) => r.roleId)).to.include(role.data.data.id);

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq('pong');
    },
  }),
  /*
   * Scenario is for the copy module feature on the frontend,
   * which does an export/import to emulate copying a module.
   * The issue is that the internal items of the data (hooks, commands, etc) are not being copied over.
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: exporting a module and then importing that data should work',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'original-module',
        })
      ).data.data;

      await this.client.hook.hookControllerCreate({
        name: 'cool-hook',
        versionId: module.latestVersion.id,
        regex: '',
        eventType: HookCreateDTOEventTypeEnum.ChatMessage,
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { } = data;
        }
        await main();`,
      });

      const exportedModule = await this.client.module.moduleControllerExport(module.id);
      await this.client.module.moduleControllerImport(exportedModule.data.data);

      const importedModule = (
        await this.client.module.moduleControllerSearch({
          filters: { name: ['original-module-imported'] },
        })
      ).data.data;

      const tags = (await this.client.module.moduleControllerGetTags(importedModule[0].id)).data.data;

      expect(importedModule.length).to.be.eq(1);
      expect(tags.length).to.be.eq(1);
      const importedVersions = await this.client.module.moduleVersionControllerGetModuleVersion(tags[0].id);
      expect(importedVersions.data.data.hooks.length).to.be.eq(1);
    },
  }),
  /**
   * This is to ease the transition of the old module system to the new one.
   * If this test breaks and this commit is months old, you can probably just delete it 🙃
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: importing a module from the old module system should work',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const oldModule = await readFile(join(__dirname, 'data', 'hvb_serverMessages_v2.json'), 'utf8');

      await this.client.module.moduleControllerImport(JSON.parse(oldModule));

      const importedModule = (
        await this.client.module.moduleControllerSearch({
          filters: { name: ['hvb_serverMessages_v2'] },
        })
      ).data.data;
      const tags = (await this.client.module.moduleControllerGetTags(importedModule[0].id)).data.data;

      expect(importedModule.length).to.be.eq(1);
      expect(tags.length).to.be.eq(1);
      const importedVersions = await this.client.module.moduleVersionControllerGetModuleVersion(tags[0].id);

      expect(importedVersions.data.data.cronJobs.length).to.be.eq(1);
    },
  }),
  /**
   * Create a role with a system permission (like manage modules)
   * Assign this role to a player, ensure the player has linked their profile to a user
   * When the player uses the API to do something that requires the permission, it should work
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: assigning permissions to a linked player should work with api checks',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const manageModulesPerm = await this.client.permissionCodesToInputs([PERMISSIONS.ReadModules]);
      const role = await this.client.role.roleControllerCreate({
        name: 'module editor role',
        permissions: manageModulesPerm,
      });

      const playerId = this.setupData.pogs1[0].playerId;
      const { client: userClient } = await createUserForPlayer(
        this.client,
        playerId,
        this.setupData.gameServer1.id,
        true,
      );

      // First try, this should fail
      try {
        await userClient.module.moduleControllerSearch();
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(403);
        expect(error.response?.data.meta.error.message).to.be.eq('Forbidden');
      }

      // Then assign the permission
      await this.client.player.playerControllerAssignRole(playerId, role.data.data.id);
      // Next attempt should work
      const mod = (await userClient.module.moduleControllerSearch()).data.data;
      expect(mod).to.be.an('array');
    },
  }),
  /**
   * When creating functions (cronjobs, commands, hooks) in a module, there's a limit to how many functions can be created.
   * This test sets up a module and fills it with the maximum number of functions, then tries to add one more. It checks every function type.
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Hitting the function limit should return an error',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');
      const domain = (await this.adminClient.domain.domainControllerGetOne(this.standardDomainId)).data.data;
      if (!domain) throw new Error('No domain');
      const module = (await this.client.module.moduleControllerCreate({ name: randomUUID() })).data.data;

      // Fill with functions
      const maxFunctions = domain.maxFunctionsInModule;
      await Promise.all(
        Array.from({ length: maxFunctions }, (_, i) =>
          this.client.hook.hookControllerCreate({
            name: `hook-${i}`,
            versionId: module.latestVersion.id,
            regex: '',
            eventType: HookCreateDTOEventTypeEnum.ChatMessage,
            function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { } = data;
        }
        await main();`,
          }),
        ),
      );

      // Now, every new one we try to create should fail
      try {
        await this.client.hook.hookControllerCreate({
          name: 'hook-should-fail',
          versionId: module.latestVersion.id,
          regex: '',
          eventType: HookCreateDTOEventTypeEnum.ChatMessage,
          function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
              const { } = data;
          }
          await main();`,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.be.eq('This module has reached the limit of 50 functions');
      }

      try {
        await this.client.command.commandControllerCreate({
          name: 'command-should-fail',
          versionId: module.latestVersion.id,
          trigger: 'test',
          function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
              const { } = data;
          }
          await main();`,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.be.eq('This module has reached the limit of 50 functions');
      }

      try {
        await this.client.cronjob.cronJobControllerCreate({
          name: 'cronjob-should-fail',
          versionId: module.latestVersion.id,
          temporalValue: '0 0 * * *',
          function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
              const { } = data;
          }
          await main();`,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.be.eq('This module has reached the limit of 50 functions');
      }

      try {
        await this.client.function.functionControllerCreate({
          name: 'function-should-fail',
          versionId: module.latestVersion.id,
          code: `import { data, takaro } from '@takaro/helpers';
          async function main() {
              const { } = data;
          }
          await main();`,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.be.eq('This module has reached the limit of 50 functions');
      }

      // We can still search for them
      const hooks = await this.client.hook.hookControllerSearch({
        filters: { moduleId: [module.id] },
      });

      // We can also still GET them
      const hook = await this.client.hook.hookControllerGetOne(hooks.data.data[0].id);
      expect(hook.data.data.name).to.not.be.undefined;

      // And we can still delete them
      await this.client.hook.hookControllerRemove(hook.data.data.id);
    },
  }),
  /**
   * Takaro has a system for limiting management-users via billing plans
   * The system should properly validate if a user can perform management actions based on this
   * So the test will create a new user via the ingame linking flow
   * This user should be able to read data (assuming they have the permission for it)
   * But they cannot edit/create data (even though they have the permission for it!)
   * After making this user a 'dashboardUser', they should be able to edit/create data
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Management permissions should respect billing plan limits',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create a role with management permissions
      const manageModulesPerm = await this.client.permissionCodesToInputs([
        PERMISSIONS.ManageModules,
        PERMISSIONS.ReadModules,
      ]);
      const role = await this.client.role.roleControllerCreate({
        name: 'module editor role',
        permissions: manageModulesPerm,
      });

      // Create a user via player linking flow
      const playerId = this.setupData.pogs1[0].playerId;
      const { client: userClient, user } = await createUserForPlayer(
        this.client,
        playerId,
        this.setupData.gameServer1.id,
        true,
      );

      // Assign management role to player
      await this.client.player.playerControllerAssignRole(playerId, role.data.data.id);

      // Should be able to read modules
      const modules = await userClient.module.moduleControllerSearch();
      expect(modules.data.data).to.be.an('array');

      // Should NOT be able to create modules (not a dashboard user)
      try {
        await userClient.module.moduleControllerCreate({ name: 'test module' });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.contain('dashboard user');
      }

      // Make the user a dashboard user
      if (!this.standardDomainId) throw new Error('No standard domain id');
      await this.client.user.userControllerUpdate(user.id, { isDashboardUser: true });

      // Now should be able to create modules
      const newModule = await userClient.module.moduleControllerCreate({ name: 'test module' });
      expect(newModule.data.data.name).to.equal('test module');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
