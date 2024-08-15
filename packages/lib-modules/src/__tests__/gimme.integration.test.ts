import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';

const group = 'gimme suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can give an item to a player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.gimmeModule.id,
        {
          userConfig: JSON.stringify({
            items: ['apple', 'banana', 'orange'],
            commands: [],
          }),
        },
      );
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/gimme',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.match(/You received (apple|banana|orange)/);
    },
  }),
  /*   new IntegrationTest<IModuleTestsSetupData>({
      group,
      snapshot: false,
      setup: modulesTestSetup,
      name: 'Can execute command',
      test: async function () {
        await this.client.gameserver.gameServerControllerInstallModule(
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
  
        expect((await events).length).to.be.eq(1);
        expect((await events)[0].data.meta.msg).to.eq('hello from test');
      },
    }), */
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'When no items or commands configured, displays an error',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.gimmeModule.id,
        {
          userConfig: JSON.stringify({
            items: [],
            commands: [],
          }),
        },
      );

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/gimme',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.match(/No items or commands configured/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
