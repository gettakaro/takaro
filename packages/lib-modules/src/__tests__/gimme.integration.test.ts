import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents, HookEvents } from '../dto/index.js';
import { faker } from '@faker-js/faker';
import { describe } from 'vitest';

const group = 'gimme suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can give an item to a player',
    test: async function () {
      const items = (await this.client.item.itemControllerSearch()).data.data;
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.gimmeModule.latestVersion.id,
        userConfig: JSON.stringify({
          items: items.map((item) => ({
            item: item.id,
            amount: faker.number.int({ min: 1, max: 5 }),
            quality: faker.number.int({ min: 1, max: 6 }).toString(),
          })),
          commands: [],
        }),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      const executionEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        HookEvents.COMMAND_EXECUTED,
      );

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/gimme',
        playerId: this.setupData.players[0].id,
      });

      const resultLogs = (await executionEvents)[0].data.meta.result.logs;
      expect(resultLogs.some((log: any) => log.msg.match(/giveItem 200 OK/))).to.be.true;

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.match(/You received \dx \w/);
    },
  }),
  /*   new IntegrationTest<IModuleTestsSetupData>({
      group,
      snapshot: false,
      setup: modulesTestSetup,
      name: 'Can execute command',
      test: async function () {
        await this.client.module.moduleInstallationsControllerInstallModule(
          this.setupData.gameserver.id,
          this.setupData.gimmeModule.id,
          {
            userConfig: JSON.stringify({
              items: [],
              commands: ['say hello from test'],
            }),
          },
        );
  
        const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
  
        await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: '/gimme',
          playerId: this.setupData.players[0].id,
        });
  
        expect((await events).length).to.equal(1);
        expect((await events)[0].data.meta.msg).to.equal('hello from test');
      },
    }), */
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'When no items or commands configured, displays an error',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.gimmeModule.latestVersion.id,
        userConfig: JSON.stringify({
          items: [],
          commands: [],
        }),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/gimme',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.match(/No items or commands configured/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
