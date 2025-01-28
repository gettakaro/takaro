import { IntegrationTest, expect, SetupGameServerPlayers, EventsAwaiter, createUserForPlayer } from '@takaro/test';
import { randomUUID } from 'crypto';
import { HookCreateDTOEventTypeEnum, PERMISSIONS } from '@takaro/apiclient';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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
      const manageModulesPerm = await this.client.permissionCodesToInputs([PERMISSIONS.ManageModules]);
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
      await this.client.player.playerControllerAssignRole(playerId, role.data.data.id);

      const mod = (await userClient.module.moduleControllerCreate({ name: 'testing module' })).data.data;
      expect(mod.name).to.be.eq('testing module');
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

      expect(importedModule.length).to.be.eq(1);
      expect(importedModule[0].versions.length).to.be.eq(1);
      const importedVersions = await this.client.module.moduleVersionControllerGetModuleVersion(
        importedModule[0].versions[0].id,
      );
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

      expect(importedModule.length).to.be.eq(1);
      expect(importedModule[0].versions.length).to.be.eq(1);
      const importedVersions = await this.client.module.moduleVersionControllerGetModuleVersion(
        importedModule[0].versions[0].id,
      );

      expect(importedVersions.data.data.cronJobs.length).to.be.eq(1);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
