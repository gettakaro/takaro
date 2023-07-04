import { logger, traceableClass } from '@takaro/util';
import { IGamePlayer } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  IGameServer,
  IItemDTO,
  IMessageOptsDTO,
  IPlayerReferenceDTO,
  IPosition,
  TestReachabilityOutput,
} from '../../interfaces/GameServer.js';
import { MockEmitter } from './emitter.js';
import { Socket, io } from 'socket.io-client';
import assert from 'assert';
import { MockConnectionInfo } from './connectionInfo.js';

@traceableClass('game:mock')
export class Mock implements IGameServer {
  private logger = logger('Mock');
  connectionInfo: MockConnectionInfo;
  emitter: MockEmitter;
  io: Socket;

  constructor(config: MockConnectionInfo) {
    this.connectionInfo = config;
    this.io = io(this.connectionInfo.host);
    this.emitter = new MockEmitter(this.connectionInfo, this.io);
  }

  getEventEmitter() {
    return this.emitter;
  }

  private async getClient(timeout = 5000): Promise<Socket> {
    if (this.io.connected) {
      return this.io;
    }

    return Promise.race([
      new Promise<Socket>((resolve, reject) => {
        this.io.on('connect', () => {
          resolve(this.io);
        });
        this.io.on('connect_error', (err) => {
          reject(err);
        });
      }),
      new Promise<Socket>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Connection timed out after ${timeout}ms`));
        }, timeout);
      }),
    ]);
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const client = await this.getClient();
    const data = await client.emitWithAck('getPlayer', player);
    return data;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const client = await this.getClient();
    const data = await client.emitWithAck('getPlayers');
    return data;
  }

  async getPlayerLocation(player: IGamePlayer): Promise<IPosition | null> {
    const client = await this.getClient();
    const data = await client.emitWithAck('getPlayerLocation', player);
    return data;
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    try {
      const client = await this.getClient();
      const data = await client.emitWithAck('ping');
      assert(data === 'pong');
    } catch (error) {
      if (!error || !(error instanceof Error)) {
        return new TestReachabilityOutput().construct({
          connectable: false,
          reason: 'Unknown error',
        });
      }

      if (error.name === 'AssertionError') {
        return new TestReachabilityOutput().construct({
          connectable: false,
          reason: 'Server responded with invalid data',
        });
      }

      return new TestReachabilityOutput().construct({
        connectable: false,
        reason: 'Unable to connect to server',
      });
    }

    return new TestReachabilityOutput().construct({
      connectable: true,
    });
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    const client = await this.getClient();
    const data = await client.emitWithAck('executeConsoleCommand', rawCommand);
    return data;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const client = await this.getClient();
    const data = await client.emitWithAck('sendMessage', message, opts);
    return data;
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    const client = await this.getClient();
    const data = await client.emitWithAck('teleportPlayer', player, x, y, z);
    return data;
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    const client = await this.getClient();
    const data = await client.emitWithAck('kickPlayer', player, reason);
    return data;
  }

  async banPlayer(options: BanDTO) {
    const client = await this.getClient();
    const data = await client.emitWithAck('banPlayer', options);
    return data;
  }

  async unbanPlayer(player: IGamePlayer) {
    const client = await this.getClient();
    const data = await client.emitWithAck('unbanPlayer', player);
    return data;
  }

  async listBans(): Promise<BanDTO[]> {
    const client = await this.getClient();
    const data = await client.emitWithAck('listBans');
    return data;
  }

  async giveItem(player: IPlayerReferenceDTO, item: IItemDTO): Promise<void> {
    const client = await this.getClient();
    await client.emitWithAck('giveItem', player, item);
  }
}
