import { TakaroEmitter, getGame } from '@takaro/gameserver';
import { GameEvents } from '@takaro/modules';
import { logger } from '@takaro/util';
import { AdminClient, Client, DomainOutputDTOStateEnum, GameServerOutputDTO } from '@takaro/apiclient';
import { config } from '../config.js';
import { queueService } from '@takaro/queues';

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
  private emitterMap = new Map<string, { domainId: string; emitter: TakaroEmitter }>();
  private eventsQueue = queueService.queues.events.queue;
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

    if (!gameServer.reachable) {
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
      await getGame(gameServer.type, gameServer.connectionInfo as Record<string, unknown>, {})
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
