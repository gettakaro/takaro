import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from '@takaro/test';
import { GameEvents } from '../dto/gameEvents.js';
import { CommandArgumentCreateDTO } from '@takaro/apiclient';

const group = 'Command args';

const createSetup = (commandArgs: CommandArgumentCreateDTO[]) => {
  return async function (this: IntegrationTest<IModuleTestsSetupData>) {
    const setupRes = await modulesTestSetup.bind(this)();
    const moduleRes = await this.client.module.moduleControllerCreate({
      name: 'test',
    });

    await this.client.command.commandControllerCreate({
      name: 'test',
      trigger: 'test',
      moduleId: moduleRes.data.data.id,
      arguments: commandArgs,
      function: `import { getTakaro, getData } from '@takaro/helpers';

      async function main() {
        const data = await getData();
        const takaro = await getTakaro(data);
        const { arguments: args } = data;
        await data.player.pm(JSON.stringify(args));
      }
      
      await main();`,
    });

    await this.client.gameserver.gameServerControllerInstallModule(setupRes.gameserver.id, moduleRes.data.data.id);

    return setupRes;
  };
};

const playerArgSetup = async function (this: IntegrationTest<IModuleTestsSetupData>) {
  const setupRes = await modulesTestSetup.bind(this)();
  const moduleRes = await this.client.module.moduleControllerCreate({
    name: 'test',
  });

  await this.client.command.commandControllerCreate({
    name: 'test',
    trigger: 'test',
    moduleId: moduleRes.data.data.id,
    arguments: [{ name: 'name', type: 'player', position: 0 }],
    function: `import { getTakaro, getData } from '@takaro/helpers';

    async function main() {
      const data = await getData();
      const takaro = await getTakaro(data);
      const { arguments: args } = data;
      await data.player.pm(args.name.gameId);
      await data.player.pm(args.name.positionX.toString());
    }
    
    await main();`,
  });

  await this.client.gameserver.gameServerControllerInstallModule(setupRes.gameserver.id, moduleRes.data.data.id);

  return setupRes;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Sends a clear error when passing invalid arguments (passing string to number args)',
    group,
    snapshot: false,
    setup: createSetup([
      {
        name: 'test',
        type: 'number',
        position: 0,
      },
    ]),
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test "test"',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        'The value for "test" should be a number. Please correct it and try again.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Respects default values',
    group,
    snapshot: false,
    setup: createSetup([
      { name: 'name', type: 'string', position: 0 },
      { name: 'public', type: 'boolean', position: 1, defaultValue: 'false' },
      { name: 'number', type: 'number', position: 2, defaultValue: '42' },
    ]),
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test "test"',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('{"name":"test","public":false,"number":42}');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Handles spaces properly',
    group,
    snapshot: false,
    setup: createSetup([
      { name: 'name', type: 'string', position: 0 },
      { name: 'public', type: 'boolean', position: 1 },
    ]),
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test "test test" true',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('{"name":"test test","public":true}');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Can do a basic player arg',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      const pogRes = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          playerId: [this.setupData.players[0].id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });
      const pog = pogRes.data.data[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/test ${this.setupData.players[0].name}`,
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.be.eq(pog.gameId);
      expect((await events)[1].data.msg).to.be.eq(pog.positionX?.toString());
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Can do a player arg with partial name',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      const pogRes = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          playerId: [this.setupData.players[0].id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });
      const pog = pogRes.data.data[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/test ${this.setupData.players[0].name.substring(0, 3)}`,
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.be.eq(pog.gameId);
      expect((await events)[1].data.msg).to.be.eq(pog.positionX?.toString());
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Can do a player arg with case switched',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      const pogRes = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          playerId: [this.setupData.players[0].id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });
      const pog = pogRes.data.data[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/test ${this.setupData.players[0].name.toUpperCase()}`,
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.be.eq(pog.gameId);
      expect((await events)[1].data.msg).to.be.eq(pog.positionX?.toString());
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Can do a player arg with steam ID',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      const pogRes = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          playerId: [this.setupData.players[0].id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });
      const pog = pogRes.data.data[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/test ${this.setupData.players[0].steamId}`,
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.be.eq(pog.gameId);
      expect((await events)[1].data.msg).to.be.eq(pog.positionX?.toString());
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Shows an error when multiple players are found',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Find a letter contained in one of the players' names
      const letterToSearch = ['e', 'a'].find((letter) => {
        return this.setupData.players.some((player) => {
          return player.name.includes(letter);
        });
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/test ${letterToSearch}`,
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(/Multiple players found/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    name: 'Shows an error when no players are found',
    group,
    snapshot: false,
    setup: playerArgSetup,
    test: async function () {
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test itsimpossiblethatwewilleverfindaplayerwiththisnameright',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(/No player found with the name or ID/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
