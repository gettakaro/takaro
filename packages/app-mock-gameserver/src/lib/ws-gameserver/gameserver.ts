import { EventPlayerConnected, IGamePlayer } from '@takaro/modules';
import { config } from '../../config.js';
import { WSClient } from './wsClient.js';
import { faker } from '@faker-js/faker';
import { logger } from '@takaro/util';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { randomUUID } from 'crypto';

interface IPlayerMeta {
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export class GameServer {
  private wsClient = new WSClient(config.get('ws.url'));
  private log = logger('GameServer');
  private players: Map<string, { player: IGamePlayer; meta: IPlayerMeta }> = new Map();
  private serverId = randomUUID();
  private tickInterval: NodeJS.Timeout = setInterval(() => this.handleGameServerTick(), 1000);

  private handleGameServerTick() {
    this.wsClient.send({
      type: 'gameEvent',
      payload: {
        type: 'playerConnected',
        data: new EventPlayerConnected({
          player: this.players.get('0')?.player,
        }),
      },
    });
  }

  async init() {
    return new Promise<void>((resolve) => {
      this.wsClient.on('connected', () => {
        this.log.info('Connected to WebSocket server');
        this.log.info(`Gameserver identity is ${this.serverId}`);
        this.wsClient.send({
          type: 'identify',
          payload: { identityToken: this.serverId, registrationToken: config.get('mockserver.registrationToken') },
        });
        resolve();
      });

      // Create players
      for (let i = 0; i < 10; i++) {
        const player = new IGamePlayer({
          gameId: i.toString(),
          name: faker.internet.userName(),
          epicOnlineServicesId: faker.string.alphanumeric(16),
          steamId: faker.string.alphanumeric(16),
          xboxLiveId: faker.string.alphanumeric(16),
        });
        const meta = {
          position: {
            x: faker.number.int({ min: -1000, max: 1000 }),
            y: faker.number.int({ min: 0, max: 512 }),
            z: faker.number.int({ min: -1000, max: 1000 }),
          },
        };

        this.players.set(player.gameId, { player, meta });
      }
    });
  }

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const player = this.players.get(playerRef.gameId);
    if (!player) return null;
    return player.player;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return Array.from(this.players.values()).map((p) => p.player);
  }
}
