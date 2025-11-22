import { IntegrationTest, expect, SetupGameServerPlayers, EventsAwaiter, createUserForPlayer } from '@takaro/test';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import {
  HookCreateDTOEventTypeEnum,
  PERMISSIONS,
  isAxiosError,
  GameServerOutputDTO,
  ModuleOutputDTO,
} from '@takaro/apiclient';
import { describe } from 'node:test';
import { getMockServer } from '@takaro/mock-gameserver';
import { ModuleService } from '../../service/Module/index.js';

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

      const tags = (
        await this.client.module.moduleVersionControllerSearchVersions({
          filters: { moduleId: [importedModule[0].id] },
        })
      ).data.data;

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
      const tags = (
        await this.client.module.moduleVersionControllerSearchVersions({
          filters: { moduleId: [importedModule[0].id] },
        })
      ).data.data;

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
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Creating a cronjob in a module that has latest version installed should work',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create a module, install it
      // Then create a cronjob in the module

      const moduleRes = await this.client.module.moduleControllerCreate({
        name: 'cronjob-test-module',
        latestVersion: {
          description: 'test module for cronjob',
        },
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer1.id,
        versionId: moduleRes.data.data.latestVersion.id,
      });

      const cronjobRes = await this.client.cronjob.cronJobControllerCreate({
        name: 'cronjob-test',
        versionId: moduleRes.data.data.latestVersion.id,
        temporalValue: '0 0 * * *',
      });

      expect(cronjobRes.data.data.name).to.equal('cronjob-test');
    },
  }),
  /**
   * Depending on the endpoint, strings are allowed and not validated to be UUIDs.
   * If this happens, the API would throw an internal server error
   * Instead, it should throw a clean 400 error
   */
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Passing a string as an arg to something that expects UUID returns a clean error',
    test: async function () {
      const roles = (await this.client.role.roleControllerSearch()).data.data;
      const role = roles[0];

      try {
        await this.client.role.roleControllerUpdate(role.id, {
          name: 'blabla',
          permissions: [
            {
              permissionId: 'not-uuid',
            },
          ],
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.be.eq('Invalid UUID. Passed a string instead of a UUID');
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Search endpoint filters validation - should throw error when filters is not an object with arrays',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      try {
        await this.client.module.moduleControllerSearch({
          filters: {
            // @ts-expect-error - we are testing invalid input
            name: 'blabla',
          },
        });
        throw new Error('Should have thrown a validation error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(400);
        expect(error.response?.data.meta.error.message).to.contain(
          'Filter values must be arrays or boolean. Found invalid value for',
        );
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: Expired variables remain in database causing unique constraint violations',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Create a variable that will expire immediately
      const variableKey = `test-variable-${randomUUID()}`;
      const pastDate = new Date(Date.now() - 1000).toISOString(); // 1 second in the past

      // Create the first variable with expiration in the past
      const firstVariable = await this.client.variable.variableControllerCreate({
        key: variableKey,
        value: 'first-value',
        gameServerId: this.setupData.gameServer1.id,
        expiresAt: pastDate,
      });

      expect(firstVariable.data.data.key).to.equal(variableKey);
      expect(firstVariable.data.data.value).to.equal('first-value');

      // The variable should not be findable since it's expired
      const searchResult = await this.client.variable.variableControllerSearch({
        filters: {
          key: [variableKey],
          gameServerId: [this.setupData.gameServer1.id],
        },
      });

      // Variable should not be found in search results (it's expired)
      expect(searchResult.data.data).to.have.length(0);

      // Try to delete the variable - this should fail since it's "not found" due to expiration
      try {
        await this.client.variable.variableControllerDelete(firstVariable.data.data.id);
        throw new Error('Should have thrown a not found error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.be.eq(404);
      }

      // Now try to create a new variable with the same key
      // This SHOULD work since the old one is expired
      const secondVariable = await this.client.variable.variableControllerCreate({
        key: variableKey,
        value: 'second-value',
        gameServerId: this.setupData.gameServer1.id,
      });

      // The variable should be created successfully with the new value
      expect(secondVariable.data.data.key).to.equal(variableKey);
      expect(secondVariable.data.data.value).to.equal('second-value');
    },
  }),
  /**
   * Bug repro: Builtin modules get uninstalled in production during seedModules job
   *
   * This test validates that builtin modules (teleports, economyUtils) with "latest" version
   * installed do NOT get uninstalled when seedBuiltinModules runs.
   *
   * Root cause: When updating commands/hooks/cronjobs, the services call installModule which
   * first uninstalls existing installations. With parallel processing, this caused race conditions
   * where modules would uninstall each other's installations.
   *
   * Fix: Process builtin modules sequentially instead of in parallel to prevent race conditions
   * during the uninstall/reinstall cycle triggered by command/hook/cronjob updates.
   */
  new IntegrationTest<{
    gameserver: GameServerOutputDTO;
    teleportsModule: ModuleOutputDTO;
    economyUtilsModule: ModuleOutputDTO;
    moduleService: ModuleService;
    mockserver: Awaited<ReturnType<typeof getMockServer>>;
  }>({
    group,
    snapshot: false,
    name: 'Builtin modules should not be uninstalled when seedBuiltinModules runs in production',
    setup: async function () {
      // Create a mock game server
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set');
      const identityToken = randomUUID();
      const mockServer = await this.createMockServer({
        mockserver: {
          registrationToken: this.domainRegistrationToken,
          identityToken,
        },
      });

      // Find the game server
      const gameServerRes = await this.client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [identityToken] },
      });
      const gameserver = gameServerRes.data.data.find((gs) => gs.identityToken === identityToken);
      if (!gameserver) throw new Error('Game server not found');

      // Get builtin modules
      const modules = await this.client.module.moduleControllerSearch();
      const teleportsModule = modules.data.data.find((m) => m.name === 'teleports');
      const economyUtilsModule = modules.data.data.find((m) => m.name === 'economyUtils');

      if (!teleportsModule || !economyUtilsModule) {
        throw new Error('Required builtin modules not found');
      }

      // Install the "latest" version of both modules on the game server
      // This simulates the production scenario where modules are already installed
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameserver.id,
        versionId: teleportsModule.latestVersion.id,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameserver.id,
        versionId: economyUtilsModule.latestVersion.id,
      });

      // Create service instance for direct testing
      // Use standardDomainId which is available on IntegrationTest
      if (!this.standardDomainId) throw new Error('No standard domain ID');
      const moduleService = new ModuleService(this.standardDomainId);

      return {
        gameserver,
        teleportsModule,
        economyUtilsModule,
        moduleService,
        mockserver: mockServer,
      };
    },
    teardown: async function () {
      if (this.setupData?.mockserver) {
        // GameServer has a shutdown method, not stop
        await this.setupData.mockserver.shutdown();
      }
    },
    test: async function () {
      // Set to production mode for the test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        // Verify modules are installed before seeding
        const installationsBefore = await this.client.module.moduleInstallationsControllerGetInstalledModules({
          filters: {
            gameserverId: [this.setupData.gameserver.id],
          },
        });

        // Should have at least the two modules we installed
        const teleportsInstallBefore = installationsBefore.data.data.find(
          (i: any) => i.moduleId === this.setupData.teleportsModule.id,
        );
        const economyInstallBefore = installationsBefore.data.data.find(
          (i: any) => i.moduleId === this.setupData.economyUtilsModule.id,
        );
        expect(teleportsInstallBefore).to.exist;
        expect(economyInstallBefore).to.exist;

        // Run seedBuiltinModules multiple times to simulate the periodic job
        // With the fix (sequential processing), this should NOT cause any uninstalls
        await this.setupData.moduleService.seedBuiltinModules();

        // Run multiple times in sequence to ensure stability
        // Previously, parallel execution would cause race conditions and uninstalls
        // Now with sequential processing, modules should remain installed
        for (let i = 0; i < 3; i++) {
          await this.setupData.moduleService.seedBuiltinModules();
        }

        // Verify modules are STILL installed after seeding
        const installationsAfter = await this.client.module.moduleInstallationsControllerGetInstalledModules({
          filters: {
            gameserverId: [this.setupData.gameserver.id],
          },
        });

        const teleportsInstallAfter = installationsAfter.data.data.find(
          (i: any) => i.moduleId === this.setupData.teleportsModule.id,
        );
        const economyInstallAfter = installationsAfter.data.data.find(
          (i: any) => i.moduleId === this.setupData.economyUtilsModule.id,
        );

        // CRITICAL ASSERTIONS: Modules should still be installed
        expect(teleportsInstallAfter).to.exist;
        expect(economyInstallAfter).to.exist;
        expect(teleportsInstallAfter?.moduleId).to.equal(this.setupData.teleportsModule.id);
        expect(economyInstallAfter?.moduleId).to.equal(this.setupData.economyUtilsModule.id);

        // Verify they're still using the "latest" version
        expect(teleportsInstallAfter?.versionId).to.equal(this.setupData.teleportsModule.latestVersion.id);
        expect(economyInstallAfter?.versionId).to.equal(this.setupData.economyUtilsModule.latestVersion.id);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
