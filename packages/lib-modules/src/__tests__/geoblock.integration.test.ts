import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { HookEvents } from '../dto/index.js';
import { TakaroEventPlayerNewIpDetected } from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { describe } from 'node:test';

const group = 'Geo Block';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();

  await Promise.all(
    setupData.players.map(async (player) => {
      await this.client.player.playerControllerRemoveRole(player.id, setupData.role.id);
    }),
  );

  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'DENY MODE: Blocked country detected -> player gets kicked based on configuration',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'deny',
          countries: ['RU'],
          ban: false,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.PLAYER_DISCONNECTED);
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'RU',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.playerId).to.be.eq(this.setupData.players[0].id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'DENY MODE: Non-blocked country detected -> no action taken',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'deny',
          countries: ['RU'],
          ban: false,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.HOOK_EXECUTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'BE',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      const containsAllowedCountryMessage = (await events)[0].data.meta.result.logs.some((log: any) => {
        return log.msg.includes('Allowed country detected, no action');
      });
      expect(containsAllowedCountryMessage).to.be.eq(true, 'Decision message not found');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'ALLOW MODE: Allowed country detected -> no action taken',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'allow',
          countries: ['RU'],
          ban: false,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.HOOK_EXECUTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'RU',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      const containsAllowedCountryMessage = (await events)[0].data.meta.result.logs.some((log: any) => {
        return log.msg.includes('Allowed country detected, no action');
      });
      expect(containsAllowedCountryMessage).to.be.eq(true, 'Decision message not found');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'ALLOW MODE: Non-Allowed country detected -> player gets kicked/banned based on configuration',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'allow',
          countries: ['RU'],
          ban: false,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.PLAYER_DISCONNECTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'BE',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.playerId).to.be.eq(this.setupData.players[0].id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'BAN CONFIGURATION: Ban enabled -> player gets banned instead of kicked',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'allow',
          countries: ['RU'],
          ban: true,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.PLAYER_DISCONNECTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'BE',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.playerId).to.be.eq(this.setupData.players[0].id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'MULTIPLE COUNTRIES: Handling multiple countries in the whitelist or blacklist',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'deny',
          countries: ['RU', 'BE'],
          ban: true,
          message: 'Custom message',
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.PLAYER_DISCONNECTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'BE',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.playerId).to.be.eq(this.setupData.players[0].id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'IMMUNITY PERMISSION: Player with GEOBLOCK_IMMUNITY permission is neither kicked nor banned',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'deny',
          countries: ['RU'],
          ban: true,
          message: 'Custom message',
        }),
      });
      const permissions = await this.client.permissionCodesToInputs(['GEOBLOCK_IMMUNITY']);
      const roleRes = await this.client.role.roleControllerCreate({
        name: 'Immune to geoblock',
        permissions,
      });

      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, roleRes.data.data.id);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.HOOK_EXECUTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'RU',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      const containsAllowedCountryMessage = (await events)[0].data.meta.result.logs.some((log: any) => {
        return log.msg.includes('Player has immunity, no action');
      });
      expect(containsAllowedCountryMessage).to.be.eq(true, 'Decision message not found');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'NO COUNTRIES CONFIGURED: No action taken if countries array is empty',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.geoBlockModule.latestVersion.id,
        userConfig: JSON.stringify({
          mode: 'deny',
          countries: [],
          ban: true,
          message: 'Custom message',
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.HOOK_EXECUTED);

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: HookEvents.PLAYER_NEW_IP_DETECTED,
        eventMeta: new TakaroEventPlayerNewIpDetected({
          city: 'nowhere',
          country: 'BE',
          latitude: '0',
          longitude: '0',
          ip: faker.internet.ip(),
        }),
      });

      expect((await events).length).to.be.eq(1);
      const containsAllowedCountryMessage = (await events)[0].data.meta.result.logs.some((log: any) => {
        return log.msg.includes('Allowed country detected, no action');
      });
      expect(containsAllowedCountryMessage).to.be.eq(true, 'Decision message not found');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
