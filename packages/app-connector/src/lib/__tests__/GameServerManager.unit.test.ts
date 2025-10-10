import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from '@takaro/test';
import sinon from 'sinon';
import esmock from 'esmock';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { GameEvents, EventLogLine } from '@takaro/modules';

describe('GameServerManager', () => {
  let sandboxInstance: sinon.SinonSandbox;
  let mockEmitter: any;
  let mockGameServer: any;
  let getGameStub: sinon.SinonStub;
  let queueAddStub: sinon.SinonStub;
  let adminClientInstance: any;
  let domainClientInstance: any;
  let gameServerManager: any;

  beforeEach(async () => {
    sandboxInstance = sinon.createSandbox();

    // Create mock emitter with all required methods
    mockEmitter = {
      start: sandboxInstance.stub().resolves(),
      stop: sandboxInstance.stub().resolves(),
      on: sandboxInstance.stub(),
      off: sandboxInstance.stub(),
      emit: sandboxInstance.stub().resolves(),
      listener: sandboxInstance.stub(),
    };

    // Create full mock game server
    mockGameServer = {
      connectionInfo: {},
      getEventEmitter: () => mockEmitter,
      getPlayer: sandboxInstance.stub().resolves(null),
      getPlayers: sandboxInstance.stub().resolves([]),
      getPlayerLocation: sandboxInstance.stub().resolves(null),
      getPlayerInventory: sandboxInstance.stub().resolves([]),
      giveItem: sandboxInstance.stub().resolves(),
      listItems: sandboxInstance.stub().resolves([]),
      listEntities: sandboxInstance.stub().resolves([]),
      listLocations: sandboxInstance.stub().resolves([]),
      executeConsoleCommand: sandboxInstance.stub().resolves({ rawResult: '', success: true }),
      sendMessage: sandboxInstance.stub().resolves(),
      teleportPlayer: sandboxInstance.stub().resolves(),
      testReachability: sandboxInstance.stub().resolves({ connectable: true }),
      kickPlayer: sandboxInstance.stub().resolves(),
      banPlayer: sandboxInstance.stub().resolves(),
      unbanPlayer: sandboxInstance.stub().resolves(),
      listBans: sandboxInstance.stub().resolves([]),
      shutdown: sandboxInstance.stub().resolves(),
      getMapInfo: sandboxInstance.stub().resolves({
        enabled: false,
        mapBlockSize: 0,
        maxZoom: 0,
        mapSizeX: 0,
        mapSizeY: 0,
        mapSizeZ: 0,
      }),
      getMapTile: sandboxInstance.stub().resolves(''),
    };

    getGameStub = sandboxInstance.stub().resolves(mockGameServer);
    queueAddStub = sandboxInstance.stub().resolves();

    // Mock domain client
    domainClientInstance = {
      gameserver: {
        gameServerControllerSearch: sandboxInstance.stub().resolves({
          data: {
            data: [],
            meta: { total: 0 },
          },
        }),
        gameServerControllerGetOne: sandboxInstance.stub().resolves({
          data: {
            data: {
              id: 'test-server-id',
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        }),
        gameServerControllerCreate: sandboxInstance.stub().resolves({
          data: {
            data: {
              id: 'new-server-id',
              name: 'New Server',
              type: GameServerOutputDTOTypeEnum.Generic,
              enabled: true,
              reachable: true,
            },
          },
        }),
      },
    };

    // Mock admin client
    adminClientInstance = {
      waitUntilHealthy: sandboxInstance.stub().resolves(),
      domain: {
        domainControllerSearch: sandboxInstance.stub().resolves({
          data: {
            data: [],
            meta: { total: 0 },
          },
        }),
        domainControllerGetToken: sandboxInstance.stub().resolves({
          data: { data: { token: 'mock-token' } },
        }),
        domainControllerResolveRegistrationToken: sandboxInstance.stub().resolves({
          data: {
            data: {
              id: 'domain-123',
              name: 'Test Domain',
            },
          },
        }),
      },
    };

    // Mock TakaroQueue class
    class MockTakaroQueue {
      bullQueue = {};
      name = 'events';
      add = queueAddStub;
    }

    // Use esmock to load GameServerManager with mocked dependencies
    const module = await esmock('../GameServerManager.js', {
      '@takaro/gameserver': {
        getGame: getGameStub,
      },
      '@takaro/apiclient': {
        AdminClient: class {
          constructor() {
            return adminClientInstance;
          }
        },
        Client: class {
          constructor() {
            return domainClientInstance;
          }
        },
      },
      '@takaro/queues': {
        TakaroQueue: MockTakaroQueue,
      },
    });

    gameServerManager = module.gameServerManager;
  });

  afterEach(() => {
    sandboxInstance.restore();
    // Clean up manager state
    if (gameServerManager) {
      (gameServerManager as any).emitterMap?.clear();
      (gameServerManager as any).lastMessageMap?.clear();
      (gameServerManager as any).gameServerDomainMap?.clear();
      if ((gameServerManager as any).syncInterval) {
        clearInterval((gameServerManager as any).syncInterval);
      }
      if ((gameServerManager as any).messageTimeoutInterval) {
        clearInterval((gameServerManager as any).messageTimeoutInterval);
      }
    }
  });

  describe('Happy Path Tests', () => {
    describe('add()', () => {
      it('should successfully add a reachable and enabled game server', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId, // Use the actual passed ID
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Verify getGame was called with correct parameters
        expect(getGameStub).to.have.been.calledOnce;
        expect(getGameStub.firstCall.args[0]).to.equal(GameServerOutputDTOTypeEnum.Rust);

        // Verify emitter.start was called
        expect(mockEmitter.start).to.have.been.calledOnce;

        // Verify server is tracked in internal maps
        const emitterMap = (gameServerManager as any).emitterMap;
        expect(emitterMap.has(gameServerId)).to.be.true;
        expect(emitterMap.get(gameServerId).domainId).to.equal(domainId);

        const lastMessageMap = (gameServerManager as any).lastMessageMap;
        expect(lastMessageMap.has(gameServerId)).to.be.true;

        const gameServerDomainMap = (gameServerManager as any).gameServerDomainMap;
        expect(gameServerDomainMap.get(gameServerId)).to.equal(domainId);
      });

      it('should attach event listeners for all game events', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Verify all event listeners were attached
        expect(mockEmitter.on).to.have.been.called;

        // Check for specific events
        const calls = mockEmitter.on.getCalls();
        const eventTypes = calls.map((call: any) => call.args[0]);

        expect(eventTypes).to.include('error');
        expect(eventTypes).to.include(GameEvents.LOG_LINE);
        expect(eventTypes).to.include(GameEvents.PLAYER_CONNECTED);
        expect(eventTypes).to.include(GameEvents.PLAYER_DISCONNECTED);
        expect(eventTypes).to.include(GameEvents.CHAT_MESSAGE);
        expect(eventTypes).to.include(GameEvents.PLAYER_DEATH);
        expect(eventTypes).to.include(GameEvents.ENTITY_KILLED);
      });

      it('should update lastMessageMap timestamp on event', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        const initialTimestamp = (gameServerManager as any).lastMessageMap.get(gameServerId);

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Simulate receiving a log line event
        const logLineHandler = mockEmitter.on.getCalls().find((call: any) => call.args[0] === GameEvents.LOG_LINE)
          ?.args[1] as (event: EventLogLine) => Promise<void>;

        expect(logLineHandler).to.exist;
        if (logLineHandler) {
          await logLineHandler(new EventLogLine({ msg: 'test log' }));
        }

        const updatedTimestamp = (gameServerManager as any).lastMessageMap.get(gameServerId);
        expect(updatedTimestamp).to.be.greaterThan(initialTimestamp);
      });

      it('should add events to queue when game events are received', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Simulate receiving a log line event
        const logLineHandler = mockEmitter.on.getCalls().find((call: any) => call.args[0] === GameEvents.LOG_LINE)
          ?.args[1] as (event: EventLogLine) => Promise<void>;

        const testEvent = new EventLogLine({ msg: 'test log' });
        if (logLineHandler) {
          await logLineHandler(testEvent);
        }

        // Verify event was added to queue
        expect(queueAddStub).to.have.been.calledWith({
          type: GameEvents.LOG_LINE,
          event: testEvent,
          domainId,
          gameServerId,
        });
      });

      it('should skip unreachable non-generic servers', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Mock unreachable server
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Unreachable Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: false,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Verify getGame was NOT called
        expect(getGameStub).to.not.have.been.called;

        // Verify server is NOT in emitter map
        const emitterMap = (gameServerManager as any).emitterMap;
        expect(emitterMap.has(gameServerId)).to.be.false;
      });

      it('should skip disabled servers', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Mock disabled server
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Disabled Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: false,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Verify getGame was NOT called
        expect(getGameStub).to.not.have.been.called;

        // Verify server is NOT in emitter map
        const emitterMap = (gameServerManager as any).emitterMap;
        expect(emitterMap.has(gameServerId)).to.be.false;
      });

      it('should remove existing server before adding if already connected', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        // Add server first time
        await gameServerManager.add(domainId, gameServerId);
        const firstEmitter = mockEmitter;

        // Reset stub call counts
        getGameStub.resetHistory();
        mockEmitter.start.resetHistory();

        // Create new mock emitter for second add
        const secondMockEmitter = {
          start: sandboxInstance.stub().resolves(),
          stop: sandboxInstance.stub().resolves(),
          on: sandboxInstance.stub(),
          off: sandboxInstance.stub(),
          emit: sandboxInstance.stub().resolves(),
          listener: sandboxInstance.stub(),
        };

        const secondMockGameServer = {
          connectionInfo: {},
          getEventEmitter: () => secondMockEmitter,
          getPlayer: sandboxInstance.stub().resolves(null),
          getPlayers: sandboxInstance.stub().resolves([]),
          getPlayerLocation: sandboxInstance.stub().resolves(null),
          getPlayerInventory: sandboxInstance.stub().resolves([]),
          giveItem: sandboxInstance.stub().resolves(),
          listItems: sandboxInstance.stub().resolves([]),
          listEntities: sandboxInstance.stub().resolves([]),
          listLocations: sandboxInstance.stub().resolves([]),
          executeConsoleCommand: sandboxInstance.stub().resolves({ rawResult: '', success: true }),
          sendMessage: sandboxInstance.stub().resolves(),
          teleportPlayer: sandboxInstance.stub().resolves(),
          testReachability: sandboxInstance.stub().resolves({ connectable: true }),
          kickPlayer: sandboxInstance.stub().resolves(),
          banPlayer: sandboxInstance.stub().resolves(),
          unbanPlayer: sandboxInstance.stub().resolves(),
          listBans: sandboxInstance.stub().resolves([]),
          shutdown: sandboxInstance.stub().resolves(),
          getMapInfo: sandboxInstance.stub().resolves({
            enabled: false,
            mapBlockSize: 0,
            maxZoom: 0,
            mapSizeX: 0,
            mapSizeY: 0,
            mapSizeZ: 0,
          }),
          getMapTile: sandboxInstance.stub().resolves(''),
        };

        getGameStub.resolves(secondMockGameServer);

        // Add same server again
        await gameServerManager.add(domainId, gameServerId);

        // Verify old emitter was stopped
        expect(firstEmitter.stop).to.have.been.calledOnce;

        // Verify new server was added
        expect(getGameStub).to.have.been.calledOnce;
        expect(secondMockEmitter.start).to.have.been.calledOnce;
      });
    });

    describe('remove()', () => {
      it('should successfully remove a game server', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        // First add a server
        await gameServerManager.add(domainId, gameServerId);

        // Verify it's added
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.true;

        // Now remove it
        await gameServerManager.remove(gameServerId);

        // Verify emitter.stop was called
        expect(mockEmitter.stop).to.have.been.calledOnce;

        // Verify server is removed from all maps
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.false;
        expect((gameServerManager as any).lastMessageMap.has(gameServerId)).to.be.false;
      });

      it('should handle removing a non-existent server gracefully', async () => {
        const gameServerId = 'non-existent-server';

        // Should not throw
        await gameServerManager.remove(gameServerId);

        // Verify stop was not called (emitter was never created)
        expect(mockEmitter.stop).to.not.have.been.called;
      });
    });

    describe('update()', () => {
      it('should remove and re-add a game server', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Update the mock to return the gameServerId we pass in
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        // First add a server
        await gameServerManager.add(domainId, gameServerId);
        const firstEmitter = mockEmitter;

        // Reset stubs
        getGameStub.resetHistory();

        // Create new mock emitter for update
        const newMockEmitter = {
          start: sandboxInstance.stub().resolves(),
          stop: sandboxInstance.stub().resolves(),
          on: sandboxInstance.stub(),
          off: sandboxInstance.stub(),
          emit: sandboxInstance.stub().resolves(),
          listener: sandboxInstance.stub(),
        };

        const newMockGameServer = {
          connectionInfo: {},
          getEventEmitter: () => newMockEmitter,
          getPlayer: sandboxInstance.stub().resolves(null),
          getPlayers: sandboxInstance.stub().resolves([]),
          getPlayerLocation: sandboxInstance.stub().resolves(null),
          getPlayerInventory: sandboxInstance.stub().resolves([]),
          giveItem: sandboxInstance.stub().resolves(),
          listItems: sandboxInstance.stub().resolves([]),
          listEntities: sandboxInstance.stub().resolves([]),
          listLocations: sandboxInstance.stub().resolves([]),
          executeConsoleCommand: sandboxInstance.stub().resolves({ rawResult: '', success: true }),
          sendMessage: sandboxInstance.stub().resolves(),
          teleportPlayer: sandboxInstance.stub().resolves(),
          testReachability: sandboxInstance.stub().resolves({ connectable: true }),
          kickPlayer: sandboxInstance.stub().resolves(),
          banPlayer: sandboxInstance.stub().resolves(),
          unbanPlayer: sandboxInstance.stub().resolves(),
          listBans: sandboxInstance.stub().resolves([]),
          shutdown: sandboxInstance.stub().resolves(),
          getMapInfo: sandboxInstance.stub().resolves({
            enabled: false,
            mapBlockSize: 0,
            maxZoom: 0,
            mapSizeX: 0,
            mapSizeY: 0,
            mapSizeZ: 0,
          }),
          getMapTile: sandboxInstance.stub().resolves(''),
        };

        getGameStub.resolves(newMockGameServer);

        // Now update it
        await gameServerManager.update(domainId, gameServerId);

        // Verify old emitter was stopped
        expect(firstEmitter.stop).to.have.been.calledOnce;

        // Verify new server was added
        expect(getGameStub).to.have.been.calledOnce;
        expect(newMockEmitter.start).to.have.been.calledOnce;
      });
    });

    describe('handleWsIdentify()', () => {
      it('should register a new generic game server', async () => {
        const identityToken = 'identity-123';
        const registrationToken = 'registration-456';
        const name = 'Generic Server';

        // Mock no existing servers found
        domainClientInstance.gameserver.gameServerControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [],
            meta: { total: 0 },
          },
        });

        // Mock server creation returns generic server
        const createdServer = {
          id: 'new-server-id',
          name,
          type: GameServerOutputDTOTypeEnum.Generic,
          identityToken,
          connectionInfo: JSON.stringify({ identityToken }),
          enabled: true,
          reachable: true,
        };

        domainClientInstance.gameserver.gameServerControllerCreate = sandboxInstance.stub().resolves({
          data: { data: createdServer },
        });

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: { data: createdServer },
        });

        const result = await gameServerManager.handleWsIdentify(identityToken, registrationToken, name);

        expect(result).to.equal('new-server-id');
        expect(domainClientInstance.gameserver.gameServerControllerCreate).to.have.been.calledOnce;
      });

      it('should find and return existing generic game server', async () => {
        const identityToken = 'identity-123';
        const registrationToken = 'registration-456';

        // Mock existing server found
        const existingServer = {
          id: 'existing-server-id',
          name: 'Existing Server',
          type: GameServerOutputDTOTypeEnum.Generic,
          identityToken,
          connectionInfo: JSON.stringify({ identityToken }),
          enabled: true,
          reachable: true,
        };

        domainClientInstance.gameserver.gameServerControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [existingServer],
            meta: { total: 1 },
          },
        });

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: { data: existingServer },
        });

        const result = await gameServerManager.handleWsIdentify(identityToken, registrationToken);

        expect(result).to.equal('existing-server-id');
        expect(domainClientInstance.gameserver.gameServerControllerCreate).to.not.have.been.called;
      });
    });

    describe('syncServers()', () => {
      it('should add new enabled and reachable servers', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Mock active domains
        adminClientInstance.domain.domainControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [{ id: domainId, name: 'Test Domain', state: 'ACTIVE' }],
            meta: { total: 1 },
          },
        });

        // Mock game servers
        domainClientInstance.gameserver.gameServerControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [
              {
                id: gameServerId,
                name: 'Test Server',
                type: GameServerOutputDTOTypeEnum.Rust,
                enabled: true,
                reachable: true,
              },
            ],
            meta: { total: 1 },
          },
        });

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await (gameServerManager as any).syncServers();

        // Verify server was added
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.true;
      });

      it('should skip generic servers in sync', async () => {
        const domainId = 'domain-123';
        const genericServerId = 'generic-server-456';

        // Mock active domains
        adminClientInstance.domain.domainControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [{ id: domainId, name: 'Test Domain', state: 'ACTIVE' }],
            meta: { total: 1 },
          },
        });

        // Mock generic game server
        domainClientInstance.gameserver.gameServerControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [
              {
                id: genericServerId,
                name: 'Generic Server',
                type: GameServerOutputDTOTypeEnum.Generic,
                enabled: true,
                reachable: true,
              },
            ],
            meta: { total: 1 },
          },
        });

        await (gameServerManager as any).syncServers();

        // Verify generic server was NOT added
        expect((gameServerManager as any).emitterMap.has(genericServerId)).to.be.false;
      });

      it('should remove servers no longer in the list', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // First add a server manually
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.true;

        // Now sync with empty server list
        adminClientInstance.domain.domainControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [{ id: domainId, name: 'Test Domain', state: 'ACTIVE' }],
            meta: { total: 1 },
          },
        });

        domainClientInstance.gameserver.gameServerControllerSearch = sandboxInstance.stub().resolves({
          data: {
            data: [],
            meta: { total: 0 },
          },
        });

        await (gameServerManager as any).syncServers();

        // Verify server was removed
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.false;
        expect(mockEmitter.stop).to.have.been.called;
      });
    });
  });

  describe('Bug Reproduction Tests', () => {
    describe('Bug 1: Reachability Check Prevents Reconnection', () => {
      it('should attempt reconnection even when server becomes unreachable', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        // Add a healthy server first
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.true;

        // Simulate timeout by setting old timestamp
        (gameServerManager as any).lastMessageMap.set(gameServerId, Date.now() - 65000);

        // Mock API now returns unreachable
        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: false, // Changed to unreachable
            },
          },
        });

        // Trigger reconnection attempt
        await (gameServerManager as any).handleMessageTimeout();

        // Should reconnect despite unreachable flag
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.true;
        expect((gameServerManager as any).lastMessageMap.has(gameServerId)).to.be.true;
      });
    });

    describe('Bug 2: Memory Leak in remove()', () => {
      it('should clean up all maps when removing a server', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        await gameServerManager.add(domainId, gameServerId);

        // Verify all maps populated
        expect((gameServerManager as any).gameServerDomainMap.get(gameServerId)).to.equal(domainId);

        await gameServerManager.remove(gameServerId);

        // All maps should be cleaned up
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.false;
        expect((gameServerManager as any).lastMessageMap.has(gameServerId)).to.be.false;
        expect((gameServerManager as any).gameServerDomainMap.has(gameServerId)).to.be.false;
      });
    });

    describe('Bug 3: Connection Failure Handling', () => {
      it('should handle connection failures without throwing', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        // Mock getGame to fail
        getGameStub.rejects(new Error('Connection timeout'));

        // Should not throw
        await gameServerManager.add(domainId, gameServerId);

        // Server should not be tracked after failure
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.false;
      });

      it('should handle emitter.start() failures without throwing', async () => {
        const domainId = 'domain-123';
        const gameServerId = 'server-456';

        domainClientInstance.gameserver.gameServerControllerGetOne = sandboxInstance.stub().resolves({
          data: {
            data: {
              id: gameServerId,
              name: 'Test Server',
              type: GameServerOutputDTOTypeEnum.Rust,
              connectionInfo: { host: 'localhost', port: 28015 },
              enabled: true,
              reachable: true,
            },
          },
        });

        // Mock emitter that fails on start
        const failingEmitter = {
          start: sandboxInstance.stub().rejects(new Error('Failed to start')),
          stop: sandboxInstance.stub().resolves(),
          on: sandboxInstance.stub(),
          off: sandboxInstance.stub(),
          emit: sandboxInstance.stub().resolves(),
          listener: sandboxInstance.stub(),
        };

        getGameStub.resolves({
          connectionInfo: {},
          getEventEmitter: () => failingEmitter,
        } as any);

        // Should not throw
        await gameServerManager.add(domainId, gameServerId);

        // Server should not be tracked after failure
        expect((gameServerManager as any).emitterMap.has(gameServerId)).to.be.false;
      });
    });
  });
});
