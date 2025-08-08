import { TakaroEmitter, getGame, GenericEmitter } from '@takaro/gameserver';
import { EventMapping, GameEvents, GameEventTypes } from '@takaro/modules';
import { errors, logger } from '@takaro/util';
import {
  AdminClient,
  Client,
  DomainOutputDTO,
  DomainOutputDTOStateEnum,
  GameServerOutputDTO,
  GameServerTypesOutputDTOTypeEnum,
  isAxiosError,
} from '@takaro/apiclient';
import { config } from '../config.js';
import { TakaroQueue } from '@takaro/queues';
import { WebSocketMessage } from './websocket.js';
import { IEventQueueData } from '../lib/worker.js';

const RECONNECT_AFTER_MS = config.get('gameServerManager.reconnectAfterMs');
const SYNC_INTERVAL_MS = config.get('gameServerManager.syncIntervalMs');

const takaro = new AdminClient({
  url: config.get('takaro.url'),
  auth: {
    clientSecret: config.get('adminClientSecret'),
  },
  log: logger('adminClient'),
});

async function getDomainClient(domainId: string) {
  const tokenRes = await takaro.domain.domainControllerGetToken({
    domainId,
  });

  return new Client({
    auth: {
      token: tokenRes.data.data.token,
    },
    url: config.get('takaro.url'),
    log: logger('domainClient'),
  });
}

class GameServerManager {
  private log = logger('GameServerManager');
  private emitterMap = new Map<string, { domainId: string; emitter: TakaroEmitter | GenericEmitter }>();
  private eventsQueue = new TakaroQueue<IEventQueueData>('events');
  private lastMessageMap = new Map<string, number>();
  private gameServerDomainMap = new Map<string, string>();
  private syncInterval: NodeJS.Timeout;
  private messageTimeoutInterval: NodeJS.Timeout;

  async init() {
    await takaro.waitUntilHealthy(60000);
    await this.syncServers();
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncServers();
      } catch (error) {
        this.log.error('Error syncing game servers', error);
      }
    }, SYNC_INTERVAL_MS);
    this.messageTimeoutInterval = setInterval(() => this.handleMessageTimeout(), 5000);
  }

  /**
   * When a generic server connects to WS, we want to add it to the list of servers
   * However, we first will need to check what domain it belongs to
   * and if the GameServer record already exists in Takaro.
   * @param identityToken
   * @param registrationToken
   */
  async handleWsIdentify(identityToken: string, registrationToken: string, name?: string): Promise<string | null> {
    this.log.info('Starting WS identification process', {
      identityToken,
      registrationToken: registrationToken.slice(0, 8) + '...', // Log partial token for debugging
      name,
    });

    let domain: DomainOutputDTO;
    try {
      domain = (await takaro.domain.domainControllerResolveRegistrationToken({ registrationToken })).data.data;
      this.log.info('Registration token resolved to domain', {
        domainId: domain.id,
        domainName: domain.name,
        identityToken,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        this.log.warn(`No domain found for registrationToken ${registrationToken.slice(0, 8)}...`, { identityToken });
        throw new errors.BadRequestError('Invalid registrationToken provided');
      }
      this.log.error('Error resolving registration token', { error, identityToken });
      throw error;
    }

    const client = await getDomainClient(domain.id);
    this.log.debug('Created domain client, searching for existing game servers', {
      domainId: domain.id,
      identityToken,
    });

    // Find all 'generic' gameservers and see if any of them have the same identityToken
    const gameServers = (
      await client.gameserver.gameServerControllerSearch({
        filters: { type: [GameServerTypesOutputDTOTypeEnum.Generic], identityToken: [identityToken] },
      })
    ).data.data;

    this.log.debug('Game server search completed', {
      domainId: domain.id,
      identityToken,
      foundServers: gameServers.length,
      serverIds: gameServers.map((s) => s.id),
    });

    let existingGameServer: GameServerOutputDTO | null = null;

    for (const gameServer of gameServers) {
      if (gameServer.identityToken === identityToken) {
        existingGameServer = gameServer;
        this.log.info('Found existing game server with matching identity token', {
          domainId: domain.id,
          identityToken,
          gameServerId: gameServer.id,
          gameServerName: gameServer.name,
        });
        break;
      }
    }

    // Gameserver does not exist yet, let's register it
    if (!existingGameServer) {
      this.log.info('No existing game server found, creating new one', {
        domainId: domain.id,
        identityToken,
        name: name || identityToken,
      });
      if (!name) name = identityToken;
      existingGameServer = (
        await client.gameserver.gameServerControllerCreate({
          connectionInfo: JSON.stringify({ identityToken }),
          type: GameServerTypesOutputDTOTypeEnum.Generic,
          name,
          identityToken,
        })
      ).data.data;
      this.log.info('New game server created successfully', {
        domainId: domain.id,
        identityToken,
        gameServerId: existingGameServer.id,
        gameServerName: existingGameServer.name,
      });
    }

    this.log.info('WS identification completed, adding server to manager', {
      domainId: domain.id,
      identityToken,
      gameServerId: existingGameServer.id,
    });
    await this.add(domain.id, existingGameServer.id);

    this.log.info('Game server successfully added to manager', {
      domainId: domain.id,
      identityToken,
      gameServerId: existingGameServer.id,
    });
    return existingGameServer.id;
  }

  async handleGameMessage(gameServerId: string, msg: WebSocketMessage) {
    const res = this.emitterMap.get(gameServerId);
    if (!res) throw new errors.NotFoundError(`GameServer ${gameServerId} not found in active emitters`);
    const { emitter } = res;
    if (emitter instanceof GenericEmitter) {
      if (!msg.payload) throw new errors.BadRequestError('No payload provided');
      const { type, data } = msg.payload;
      const dtoCls = EventMapping[type as GameEventTypes];
      if (!dtoCls) throw new errors.BadRequestError(`Event ${type} is not supported`);

      const dto = new dtoCls(data as any);
      await dto.validate({ forbidNonWhitelisted: true, forbidUnknownValues: true });

      emitter.listener(type as GameEventTypes, data);
    }
  }

  private async getGameServer(gameServerId: string) {
    const domainId = this.gameServerDomainMap.get(gameServerId);
    if (!domainId) throw new Error(`No domainId found for gameServerId ${gameServerId}`);
    const client = await getDomainClient(domainId);
    const gameServerRes = await client.gameserver.gameServerControllerGetOne(gameServerId);
    return gameServerRes.data.data;
  }

  /**
   * For many _reasons_, the underlying connection to the gameserver may be lost
   * Every gameserver has it's own quirks which can be handled inside lib-gameserver
   * However, this is a catch-all for when the connection is lost
   */
  private async handleMessageTimeout() {
    for (const [gameServerId, lastMessage] of this.lastMessageMap) {
      if (Date.now() - lastMessage > RECONNECT_AFTER_MS) {
        this.log.warn(`GameServer ${gameServerId} has not sent a message in ${RECONNECT_AFTER_MS} ms, reconnecting...`);
        const domainId = this.gameServerDomainMap.get(gameServerId);
        if (!domainId) throw new Error(`No domainId found for gameServerId ${gameServerId}`);
        await this.update(domainId, gameServerId);
      }
    }
  }

  /**
   * For many _reasons_, it's possible that the list here is out of sync with reality
   * We periodically check the list of servers and add/remove them as necessary
   */
  private async syncServers() {
    const isFirstTimeRun = this.emitterMap.size === 0;
    const enabledDomains = (
      await takaro.domain.domainControllerSearch({ filters: { state: [DomainOutputDTOStateEnum.Active] } })
    ).data.data;

    const gameServers: Map<string, GameServerOutputDTO[]> = new Map();

    const results = await Promise.allSettled(
      enabledDomains.map(async (domain) => {
        const client = await getDomainClient(domain.id);
        const gameServersRes = await client.gameserver.gameServerControllerSearch({
          filters: { enabled: [true], reachable: [true] },
        });
        gameServers.set(domain.id, gameServersRes.data.data);
      }),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        this.log.error('Failed to fetch game servers', result.reason);
      }
    }
    const flatGameServers = Array.from(gameServers.values()).flat();

    this.log.debug(`Syncing ${flatGameServers.length} game servers for ${enabledDomains.length} domains`, {
      domains: enabledDomains.length,
      gameServers: flatGameServers.length,
    });

    // Add any new servers
    for (const [domainId, servers] of gameServers) {
      for (const server of servers) {
        try {
          if (server.type === GameServerTypesOutputDTOTypeEnum.Generic) {
            continue;
          }

          if (this.emitterMap.has(server.id)) {
            continue;
          }

          this.gameServerDomainMap.set(server.id, domainId);
          if (!isFirstTimeRun) this.log.warn(`GameServer ${server.id} is not connected, adding`);
          await this.add(domainId, server.id);
        } catch (error) {
          this.log.error('Failed to add game server', error);
        }
      }
    }

    // Remove any servers that are no longer in the list
    for (const [gameServerId] of this.emitterMap) {
      if (!flatGameServers.find((server) => server.id === gameServerId)) {
        try {
          this.log.info(`GameServer ${gameServerId} is no longer in the list, removing`);
          await this.remove(gameServerId);
        } catch (error) {
          this.log.error('Failed to remove game server', error);
        }
      }
    }
  }

  async add(domainId: string, gameServerId: string) {
    this.gameServerDomainMap.set(gameServerId, domainId);
    const gameServer = await this.getGameServer(gameServerId);

    if (!gameServer.reachable && gameServer.type !== GameServerTypesOutputDTOTypeEnum.Generic) {
      this.log.warn(`GameServer ${gameServerId} is not reachable, skipping...`);
      return;
    }

    if (!gameServer.enabled) {
      this.log.warn(`GameServer ${gameServerId} is not enabled, skipping...`);
      return;
    }

    if (this.emitterMap.has(gameServer.id)) {
      this.log.warn(`GameServer ${gameServerId} already connected, stopping the existing one...`);
      await this.remove(gameServer.id);
    }

    const emitter = (
      await getGame(gameServer.type, gameServer.connectionInfo as Record<string, unknown>, {}, gameServerId)
    ).getEventEmitter();
    this.emitterMap.set(gameServer.id, { domainId, emitter });

    this.attachListeners(domainId, gameServer.id, emitter);
    await emitter.start();
    this.lastMessageMap.set(gameServer.id, Date.now());
    this.log.info(`Added game server ${gameServer.id}`);
  }

  async remove(id: string) {
    const data = this.emitterMap.get(id);
    if (data) {
      const { emitter } = data;
      await emitter.stop();
      this.emitterMap.delete(id);
      this.lastMessageMap.delete(id);
      this.log.info(`Removed game server ${id}`);
    } else {
      this.log.warn('Tried to remove a GameServer from manager which does not exist');
    }
  }

  async update(domainId: string, gameServerId: string) {
    await this.remove(gameServerId);
    await this.add(domainId, gameServerId);
  }

  private attachListeners(domainId: string, gameServerId: string, emitter: TakaroEmitter) {
    emitter.on('error', (error) => {
      this.log.error('Error from game server', error);
    });

    emitter.on(GameEvents.LOG_LINE, async (logLine) => {
      this.log.verbose('Received a logline event', logLine);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.LOG_LINE,
        event: logLine,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_CONNECTED, async (playerConnectedEvent) => {
      this.log.debug('Received a player connected event', playerConnectedEvent);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.PLAYER_CONNECTED,
        event: playerConnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_DISCONNECTED, async (playerDisconnectedEvent) => {
      this.log.debug('Received a player disconnected event', playerDisconnectedEvent);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.PLAYER_DISCONNECTED,
        event: playerDisconnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.CHAT_MESSAGE, async (chatMessage) => {
      this.log.debug('Received a chatMessage event', chatMessage);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.CHAT_MESSAGE,
        event: chatMessage,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_DEATH, async (death) => {
      this.log.debug('Received a playerDeath event', death);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.PLAYER_DEATH,
        event: death,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.ENTITY_KILLED, async (entityKilled) => {
      this.log.debug('Received a entityKilled event', entityKilled);
      this.lastMessageMap.set(gameServerId, Date.now());
      await this.eventsQueue.add({
        type: GameEvents.ENTITY_KILLED,
        event: entityKilled,
        domainId,
        gameServerId,
      });
    });
  }
}

export const gameServerManager = new GameServerManager();
