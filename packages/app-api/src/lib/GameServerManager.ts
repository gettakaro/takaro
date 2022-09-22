import { IGameEventEmitter, GameEvents } from '@takaro/gameserver';
import { logger } from '@takaro/logger';
import {
  GameServerOutputDTO,
  GameServerService,
} from '../service/GameServerService';

/**
 * Handles setting up persistent connections to all game servers in the system
 * This is currently a very naive implementation, it's completely in memory and wont scale to multiple instances
 *
 * TODO: Implement a persistent connection manager that can be shared across instances
 * Deploy something in k8s probably? Helm Operator/Controller?
 */
export class IGameServerInMemoryManager {
  private log = logger('GameServerManager');
  private emitterMap = new Map<string, IGameEventEmitter>();

  async init(gameServers: GameServerOutputDTO[]) {
    this.log.info(`Initializing ${gameServers.length} game servers`);
    for (const gameServer of gameServers) {
      await this.add(gameServer);
    }
  }

  async destroy() {
    for (const [id, emitter] of this.emitterMap) {
      await emitter.stop();
      this.emitterMap.delete(id);
      this.log.info(`Removed game server ${id}`);
    }
  }

  async add(gameServer: GameServerOutputDTO) {
    const game = GameServerService.getGame(gameServer.type);
    const emitter = await game.getEventEmitter();
    this.emitterMap.set(gameServer.id, emitter);

    await emitter.start(gameServer.connectionInfo);
    this.attachListeners(emitter);

    this.log.info(`Added game server ${gameServer.id}`);
  }

  async remove(id: string) {
    const emitter = this.emitterMap.get(id);
    if (emitter) {
      await emitter.stop();
      this.emitterMap.delete(id);
      this.log.info(`Removed game server ${id}`);
    } else {
      this.log.warn(
        'Tried to remove a GameServer from manager which does not exist'
      );
    }
  }

  private attachListeners(emitter: IGameEventEmitter) {
    emitter.on(GameEvents.LOG_LINE, async (logLine) => {
      this.log.debug('Received a logline event', { logLine });
    });

    emitter.on(GameEvents.PLAYER_CONNECTED, async (playerConnectedEvent) => {
      this.log.debug('Received a player connected event', {
        playerConnectedEvent,
      });
    });

    emitter.on(GameEvents.PLAYER_SPAWNED, async (playerSpawnedEvent) => {
      this.log.debug('Received a player spawned event', { playerSpawnedEvent });
    });

    emitter.on(GameEvents.PLAYER_MESSAGED, async (playerMessagedEvent) => {
      this.log.debug('Received a player messaged event', {
        playerMessagedEvent,
      });
    });

    emitter.on(
      GameEvents.PLAYER_DISCONNECTED,
      async (playerDisconnectedEvent) => {
        this.log.debug('Received a player disconnected event', {
          playerDisconnectedEvent,
        });
      }
    );
  }
}
