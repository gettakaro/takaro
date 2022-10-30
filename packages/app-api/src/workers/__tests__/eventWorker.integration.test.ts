import { handleHooks } from '../eventWorker';
import { IntegrationTest, sandbox, expect } from '@takaro/test';
import {
  HookOutputDTOAPI,
  HookCreateDTOEventTypeEnum,
} from '@takaro/apiclient';
import { GameEvents, IGamePlayer } from '@takaro/gameserver';
import { QueuesService } from '@takaro/queues';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { v4 as uuid } from 'uuid';
import { PlayerService } from '../../service/PlayerService';

const group = 'Event worker';
const groupHooks = 'Event worker - Hook handling';

interface ISetupHooks {
  hooks: HookOutputDTOAPI[];
  gameserver: GameServerOutputDTO;
}

const tests = [
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Can handle a simple triggered hook (happy path)',
    snapshot: false,

    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;

      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hook],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        event: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Can handle multiple triggered hooks',
    snapshot: false,
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hookOne = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const hookTwo = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook 2',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hookOne, hookTwo],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        event: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledTwice;
    },
  }),
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Acts correctly when a subset of hooks get triggered',
    snapshot: false,
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hookOne = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const hookTwo = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook 2',
          regex: 'this is not',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;

      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hookOne, hookTwo],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();

      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        event: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledOnce;

      const calledItemId = addStub.lastCall.args[0];
      const calledData = addStub.lastCall.args[1];
      expect(calledItemId).to.be.eq(this.setupData.hooks[0].data.id);
      expect(calledData.domainId).to.be.eq(this.standardDomainId);
      expect(calledData.itemId).to.be.eq(this.setupData.hooks[0].data.id);
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: false,
    name: 'Handles player joined event correctly',
    setup: async function () {
      return (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'my-server',
          type: 'RUST',
          connectionInfo:
            '{"host": "169.169.169.80", "rconPort": "28016", "rconPassword": "123456"}',
        })
      ).data.data;
    },
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'brunkel',
        gameId: uuid(),
        steamId: '76561198021481871',
        device: 'windows',
      });

      await playerService.sync(MOCK_PLAYER, this.setupData.id);

      const players = await this.client.player.playerControllerSearch();

      const player = players.data.data.find(
        (player) => player.steamId === MOCK_PLAYER.steamId
      );

      expect(player).to.not.be.null;
      expect(player?.steamId).to.eq(MOCK_PLAYER.steamId);

      return players;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
