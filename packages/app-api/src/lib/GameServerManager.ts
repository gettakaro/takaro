import { TakaroEmitter, GameEvents } from '@takaro/gameserver';
import { logger } from '@takaro/util';
import { QueuesService } from '@takaro/queues';
import {
  GameServerOutputDTO,
  GameServerService,
} from '../service/GameServerService.js';

/**
 * Handles setting up persistent connections to all game servers in the system
 * This is currently a very naive implementation, it's completely in memory and wont scale to multiple instances
 *
 * TODO: Implement a persistent connection manager that can be shared across instances
 * Deploy something in k8s probably? Helm Operator/Controller?
 */
export class IGameServerInMemoryManager {
  private log = logger('GameServerManager');
  private emitterMap = new Map<
    string,
    { domainId: string; emitter: TakaroEmitter }
  >();
  private eventsQueue = QueuesService.getInstance().queues.events.queue;

  async init(domainId: string, gameServers: GameServerOutputDTO[]) {
    this.log.info(`Initializing ${gameServers.length} game servers`);
    for (const gameServer of gameServers) {
      await this.add(domainId, gameServer);
    }
  }

  async destroy() {
    for (const [id, { emitter }] of this.emitterMap) {
      await emitter.stop();
      this.emitterMap.delete(id);
      this.log.info(`Removed game server ${id}`);
    }
  }

  async add(domainId: string, gameServer: GameServerOutputDTO) {
    const emitter = (
      await GameServerService.getGame(
        gameServer.type,
        gameServer.connectionInfo
      )
    ).getEventEmitter();
    this.emitterMap.set(gameServer.id, { domainId, emitter });

    this.attachListeners(domainId, gameServer.id, emitter);
    try {
      await emitter.start();
    } catch (error) {
      this.log.warn('Error while starting gameserver', { error });
    }

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
      this.log.warn(
        'Tried to remove a GameServer from manager which does not exist'
      );
    }
  }

  private attachListeners(
    domainId: string,
    gameServerId: string,
    emitter: TakaroEmitter
  ) {
    emitter.on('error', (error) => {
      this.log.error('Error from game server', error);
    });

    emitter.on(GameEvents.LOG_LINE, async (logLine) => {
      this.log.debug('Received a logline event', logLine);
      await this.eventsQueue.add(GameEvents.LOG_LINE, {
        type: GameEvents.LOG_LINE,
        event: logLine,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_CONNECTED, async (playerConnectedEvent) => {
      this.log.debug('Received a player connected event', playerConnectedEvent);
      await this.eventsQueue.add(GameEvents.PLAYER_CONNECTED, {
        type: GameEvents.PLAYER_CONNECTED,
        event: playerConnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(
      GameEvents.PLAYER_DISCONNECTED,
      async (playerDisconnectedEvent) => {
        this.log.debug(
          'Received a player disconnected event',
          playerDisconnectedEvent
        );
        await this.eventsQueue.add(GameEvents.PLAYER_DISCONNECTED, {
          type: GameEvents.PLAYER_DISCONNECTED,
          event: playerDisconnectedEvent,
          domainId,
          gameServerId,
        });
      }
    );

    emitter.on(GameEvents.CHAT_MESSAGE, async (chatMessage) => {
      this.log.debug('Received a chatMessage event', chatMessage);
      await this.eventsQueue.add(GameEvents.CHAT_MESSAGE, {
        type: GameEvents.CHAT_MESSAGE,
        event: chatMessage,
        domainId,
        gameServerId,
      });
    });
  }
}
