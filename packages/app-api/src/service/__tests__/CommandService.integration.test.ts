import { IntegrationTest, sandbox, expect, integrationConfig, EventsAwaiter } from '@takaro/test';
import { CommandOutputDTO, GameServerOutputDTO, ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { CommandService } from '../CommandService.js';
import { queueService } from '@takaro/queues';
import { Mock } from '@takaro/gameserver';
import { IGamePlayer, EventChatMessage, HookEvents, ChatChannel } from '@takaro/modules';
import Sinon from 'sinon';
import { EventService } from '../EventService.js';
import { faker } from '@faker-js/faker';

export async function getMockPlayer(extra: Partial<IGamePlayer> = {}): Promise<IGamePlayer> {
  const data: Partial<IGamePlayer> = {
    gameId: '1',
    name: 'mock-player',
    steamId: faker.random.alphaNumeric(17),
    ...extra,
  };

  return new IGamePlayer(data);
}

const group = 'CommandService';

interface IStandardSetupData {
  normalCommand: CommandOutputDTO;
  service: CommandService;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  assignment: ModuleInstallationOutputDTO;
}

async function setup(this: IntegrationTest<IStandardSetupData>): Promise<IStandardSetupData> {
  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  const normalCommand = (
    await this.client.command.commandControllerCreate({
      name: 'Test command',
      moduleId: mod.id,
      trigger: 'test',
    })
  ).data.data;

  const gameserver = (
    await this.client.gameserver.gameServerControllerCreate({
      name: 'Test gameserver',
      type: 'MOCK',
      connectionInfo: JSON.stringify({
        host: integrationConfig.get('mockGameserver.host'),
      }),
    })
  ).data.data;

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  const connectedEvents = eventsAwaiter.waitForEvents(HookEvents.PLAYER_CONNECTED, 5);

  await this.client.gameserver.gameServerControllerExecuteCommand(gameserver.id, {
    command: 'connectAll',
  });

  await connectedEvents;

  const assignment = (await this.client.gameserver.gameServerControllerInstallModule(gameserver.id, mod.id)).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  return {
    service: new CommandService(this.standardDomainId),
    normalCommand,
    mod,
    gameserver,
    assignment,
  };
}

const tests = [
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Basic command trigger',
    setup,
    test: async function () {
      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Doesnt trigger when message doesnt start with prefix',
    setup,
    test: async function () {
      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: 'test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.not.have.been.calledOnce;

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Doesnt trigger when module is uninstalled',
    setup,
    test: async function () {
      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.client.gameserver.gameServerControllerUninstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
      );

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),

        this.setupData.gameserver.id,
      );

      expect(addStub).to.not.have.been.calledOnce;

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
      );

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Adds a delayed job when delay is configured',
    setup,
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
        {
          systemConfig: JSON.stringify({
            commands: {
              [this.setupData.normalCommand.name]: {
                delay: 5,
              },
            },
          }),
        },
      );

      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(EventService.prototype, 'create').resolves();

      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnceWith(Sinon.match.any, {
        delay: 5 * 1000,
      });
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro, install module -> create command -> command not active',
    setup,
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
      );

      await this.client.command.commandControllerCreate({
        name: 'Test command 2',
        moduleId: this.setupData.mod.id,
        trigger: 'test2',
      });

      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test2',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Doesnt trigger when module is disabled',
    setup,
    test: async function () {
      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves({
        x: 0,
        y: 0,
        z: 0,
      });

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
        {
          systemConfig: JSON.stringify({
            commands: {
              [this.setupData.normalCommand.name]: {
                enabled: false,
              },
            },
          }),
        },
      );

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),

        this.setupData.gameserver.id,
      );

      expect(addStub).to.not.have.been.calledOnce;

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.mod.id,
      );

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),
        this.setupData.gameserver.id,
      );

      expect(addStub).to.have.been.calledOnce;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
