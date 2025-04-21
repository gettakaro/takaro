import { IntegrationTest, sandbox, expect, EventsAwaiter } from '@takaro/test';
import { CommandOutputDTO, GameServerOutputDTO, ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { CommandService } from '../CommandService.js';
import { queueService } from '@takaro/queues';
import { Mock } from '@takaro/gameserver';
import { IGamePlayer, EventChatMessage, HookEvents, ChatChannel, IPosition } from '@takaro/modules';
import Sinon from 'sinon';
import { EventService } from '../EventService.js';
import { faker } from '@faker-js/faker';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';

export async function getMockPlayer(extra: Partial<IGamePlayer> = {}): Promise<IGamePlayer> {
  const data: Partial<IGamePlayer> = {
    gameId: '1',
    name: 'mock-player',
    steamId: faker.string.alphanumeric(17),
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
  installation: ModuleInstallationOutputDTO;
  mockservers: Awaited<ReturnType<typeof getMockServer>>[];
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
      versionId: mod.latestVersion.id,
      trigger: 'test',
    })
  ).data.data;

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  const connectedEvents = eventsAwaiter.waitForEvents(HookEvents.PLAYER_CREATED, 5);

  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  const identityToken = randomUUID();
  const mockServer = await getMockServer({
    mockserver: {
      registrationToken: this.domainRegistrationToken,
      identityToken,
    },
  });

  const gameServerRes = (
    await this.client.gameserver.gameServerControllerSearch({
      filters: { identityToken: [identityToken] },
    })
  ).data.data;
  const gameserver = gameServerRes.find((gs) => gs.identityToken === identityToken);
  if (!gameserver) throw new Error('Game server not found. Did something fail when registering?');

  await this.client.gameserver.gameServerControllerExecuteCommand(gameserver.id, {
    command: 'connectAll',
  });

  await connectedEvents;

  const installation = (
    await this.client.module.moduleInstallationsControllerInstallModule({
      gameServerId: gameserver.id,
      versionId: mod.latestVersion.id,
    })
  ).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  return {
    service: new CommandService(this.standardDomainId),
    normalCommand,
    mod,
    gameserver,
    installation,
    mockservers: [mockServer],
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
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
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
    name: 'Commands are case insensitive',
    setup,
    test: async function () {
      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/TeSt',
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
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

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
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

      await this.client.module.moduleInstallationsControllerUninstallModule(
        this.setupData.installation.moduleId,
        this.setupData.installation.gameserverId,
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

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.mod.latestVersion.id,
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
    name: 'Adds a delayed job when delay is configured',
    setup,
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.mod.latestVersion.id,
        systemConfig: JSON.stringify({
          commands: {
            [this.setupData.normalCommand.name]: {
              delay: 5,
            },
          },
        }),
      });

      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(EventService.prototype, 'create').resolves();

      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

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
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.mod.latestVersion.id,
      });

      await this.client.command.commandControllerCreate({
        name: 'Test command 2',
        versionId: this.setupData.mod.latestVersion.id,
        trigger: 'test2',
      });

      const addStub = sandbox.stub(queueService.queues.commands.queue, 'add');
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

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
      sandbox.stub(Mock.prototype, 'getPlayerLocation').resolves(
        new IPosition({
          x: 0,
          y: 0,
          z: 0,
        }),
      );

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.mod.latestVersion.id,

        systemConfig: JSON.stringify({
          commands: {
            [this.setupData.normalCommand.name]: {
              enabled: false,
            },
          },
        }),
      });

      await this.setupData.service.handleChatMessage(
        new EventChatMessage({
          msg: '/test',
          channel: ChatChannel.GLOBAL,
          player: await getMockPlayer(),
        }),

        this.setupData.gameserver.id,
      );

      expect(addStub).to.not.have.been.calledOnce;

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.mod.latestVersion.id,
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
