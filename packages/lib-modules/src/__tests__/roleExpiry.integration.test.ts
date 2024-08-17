import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';

const group = 'Role expiry';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Assigning an expiring role, removed when executing command',
    test: async function () {
      // First, ensure all players have no roles
      await Promise.all(
        this.setupData.players.map((p) => this.client.player.playerControllerRemoveRole(p.id, this.setupData.role.id)),
      );

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
      );

      const eventsBeforeRole = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsBeforeRole).length).to.be.eq(1);
      expect((await eventsBeforeRole)[0].data.meta.msg).to.match(/You do not have permission to use teleports/);

      // Assign the role with expiry 10 minutes from now
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

      // Execute the command again. Now it should work, since the role is assigned
      const eventsWithRole = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test2',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsWithRole).length).to.be.eq(1);
      expect((await eventsWithRole)[0].data.meta.msg).to.match(/Teleport test2 set/);

      // Remove the role and reassign with expiry 1 ms from now
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        expiresAt: new Date(Date.now() + 1).toISOString(),
      });

      // Execute the command again. Now it should not work, since the role is expired
      const eventsAfterExpire = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test3',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsAfterExpire).length).to.be.eq(1);
      expect((await eventsAfterExpire)[0].data.meta.msg).to.match(/You do not have permission to use teleports/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
