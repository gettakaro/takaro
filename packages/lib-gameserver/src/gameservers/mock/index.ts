import { logger, traceableClass } from '@takaro/util';
import { IGamePlayer, IPosition } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  IGameServer,
  IItemDTO,
  IMessageOptsDTO,
  IPlayerReferenceDTO,
  TestReachabilityOutputDTO,
} from '../../interfaces/GameServer.js';
import { MockEmitter } from './emitter.js';
import { Socket, io } from 'socket.io-client';
import assert from 'assert';
import { MockConnectionInfo } from './connectionInfo.js';
import { Settings } from '@takaro/apiclient';

@traceableClass('game:mock')
export class Mock implements IGameServer {
  private logger = logger('Mock');
  connectionInfo: MockConnectionInfo;
  emitter: MockEmitter;
  io: Socket;

  constructor(
    config: MockConnectionInfo,
    private settings: Partial<Settings> = {},
  ) {
    this.connectionInfo = config;
    if (!this.connectionInfo.name) this.connectionInfo.name = 'default';
    this.io = io(this.connectionInfo.host, {
      query: {
        name: config.name,
      },
    });
    this.emitter = new MockEmitter(this.connectionInfo, this.io);
  }

  getEventEmitter() {
    return this.emitter;
  }

  private async getClient(timeout = 2500): Promise<Socket> {
    if (this.io.connected) {
      return this.io;
    }

    return Promise.race([
      new Promise<Socket>((resolve, reject) => {
        const onConnect = () => {
          this.io.off('connect_error', onConnectError);
          resolve(this.io);
        };

        const onConnectError = (err: Error) => {
          this.io.off('connect', onConnect);
          reject(err);
        };

        this.io.on('connect', onConnect);
        this.io.on('connect_error', onConnectError);
      }),
      new Promise<Socket>((_, reject) => {
        setTimeout(() => {
          this.io.off('connect');
          this.io.off('connect_error');
          reject(new Error(`Connection timed out after ${timeout}ms`));
        }, timeout);
      }),
    ]);
  }

  private async requestFromServer(event: string, ...args: any[]) {
    const client = await this.getClient();
    return client.timeout(30000).emitWithAck(event, this.connectionInfo.name, ...args);
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    return this.requestFromServer('getPlayer', player);
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return this.requestFromServer('getPlayers');
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    return this.requestFromServer('getPlayerLocation', player);
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    const start = Date.now();
    try {
      const data = await this.requestFromServer('ping');
      assert(data === 'pong');
    } catch (error) {
      if (!error || !(error instanceof Error)) {
        return new TestReachabilityOutputDTO({
          connectable: false,
          reason: `Unknown error: ${error}`,
        });
      }

      if (error.name === 'AssertionError') {
        return new TestReachabilityOutputDTO({
          connectable: false,
          reason: 'Server responded with invalid data',
        });
      }

      return new TestReachabilityOutputDTO({
        connectable: false,
        reason: `Unable to connect to server: ${error.message}`,
      });
    }

    const end = Date.now();
    return new TestReachabilityOutputDTO({
      connectable: true,
      latency: end - start,
    });
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    return this.requestFromServer('executeConsoleCommand', rawCommand);
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    return this.requestFromServer('sendMessage', message, opts);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    return this.requestFromServer('teleportPlayer', player, x, y, z);
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    return this.requestFromServer('kickPlayer', player, reason);
  }

  async banPlayer(options: BanDTO) {
    return this.requestFromServer('banPlayer', options);
  }

  async unbanPlayer(player: IGamePlayer) {
    return this.requestFromServer('unbanPlayer', player);
  }

  async listBans(): Promise<BanDTO[]> {
    return this.requestFromServer('listBans');
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality: number): Promise<void> {
    return this.requestFromServer('giveItem', player, item, amount, quality);
  }

  async listItems(): Promise<IItemDTO[]> {
    return this.requestFromServer('listItems');
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    return this.requestFromServer('getPlayerInventory', player);
  }

  async shutdown(): Promise<void> {
    return this.requestFromServer('shutdown');
  }
}
