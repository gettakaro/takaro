import { TakaroEmitter, getGame } from '@takaro/gameserver';
import { EventTypes, GameEvents } from '@takaro/modules';
import { logger } from '@takaro/util';
import { AdminClient, Client } from '@takaro/apiclient';
import { config } from '../config.js';
import { queueService } from '@takaro/queues';

const takaro = new AdminClient({
  url: config.get('takaro.url'),
  auth: {
    clientId: config.get('hydra.adminClientId'),
    clientSecret: config.get('hydra.adminClientSecret'),
  },
  OAuth2URL: config.get('hydra.publicUrl'),
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

async function getGameServer(domainId: string, gameServerId: string) {
  const client = await getDomainClient(domainId);
  const gameServerRes = await client.gameserver.gameServerControllerGetOne(gameServerId);
  return gameServerRes.data.data;
}

class GameServerManager {
  private log = logger('GameServerManager');
  private emitterMap = new Map<string, { domainId: string; emitter: TakaroEmitter }>();
  private eventsQueue = queueService.queues.events.queue;

  async init() {
    await takaro.waitUntilHealthy(60000);
    const domains = await takaro.domain.domainControllerSearch();
    for (const domain of domains.data.data) {
      const client = await getDomainClient(domain.id);
      const gameServersRes = await client.gameserver.gameServerControllerSearch();

      try {
        await Promise.allSettled(
          gameServersRes.data.data.map((gameServer) => {
            return this.add(domain.id, gameServer.id);
          })
        );
      } catch (error) {
        this.log.warn(`Error starting a server for domain ${domain.id} `, {
          error,
          domain: domain.id,
        });
      }
    }
  }

  async add(domainId: string, gameServerId: string) {
    const gameServer = await getGameServer(domainId, gameServerId);

    const emitter = (
      await getGame(gameServer.type, gameServer.connectionInfo as Record<string, unknown>)
    ).getEventEmitter();
    this.emitterMap.set(gameServer.id, { domainId, emitter });

    this.attachListeners(domainId, gameServer.id, emitter);
    await emitter.start();
    this.log.info(`Added game server ${gameServer.id}`);
  }

  async remove(id: string) {
    const data = this.emitterMap.get(id);
    if (data) {
      const { emitter } = data;
      await emitter.stop();
      this.emitterMap.delete(id);
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

    emitter.on(EventTypes.LOG_LINE, async (logLine) => {
      this.log.debug('Received a logline event', logLine);
      await this.eventsQueue.add({
        type: EventTypes.LOG_LINE,
        event: logLine,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_CONNECTED, async (playerConnectedEvent) => {
      this.log.debug('Received a player connected event', playerConnectedEvent);
      await this.eventsQueue.add({
        type: GameEvents.PLAYER_CONNECTED,
        event: playerConnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_DISCONNECTED, async (playerDisconnectedEvent) => {
      this.log.debug('Received a player disconnected event', playerDisconnectedEvent);
      await this.eventsQueue.add({
        type: GameEvents.PLAYER_DISCONNECTED,
        event: playerDisconnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.CHAT_MESSAGE, async (chatMessage) => {
      this.log.debug('Received a chatMessage event', chatMessage);
      await this.eventsQueue.add({
        type: GameEvents.CHAT_MESSAGE,
        event: chatMessage,
        domainId,
        gameServerId,
      });
    });
  }
}

export const gameServerManager = new GameServerManager();
