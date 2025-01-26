import { IntegrationTest, expect, SetupGameServerPlayers, EventsAwaiter } from '@takaro/test';
import { randomUUID } from 'crypto';
import { HookCreateDTOEventTypeEnum } from '@takaro/apiclient';

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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
