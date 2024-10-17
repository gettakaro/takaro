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
import { MinecraftEmitter } from './emitter.js';
import assert from 'assert';
import { MinecraftConnectionInfo } from './connectionInfo.js';
import { Settings } from '@takaro/apiclient';
import WebSocket from 'ws';
import { randomUUID } from 'crypto';

const log = logger('minecraft');

@traceableClass('game:minecraft')
export class Minecraft implements IGameServer {
  connectionInfo: MinecraftConnectionInfo;
  emitter: MinecraftEmitter;
  private client: WebSocket | null;

  constructor(
    config: MinecraftConnectionInfo,
    private settings: Partial<Settings> = {},
  ) {
    this.connectionInfo = config;
    this.emitter = new MinecraftEmitter(this.connectionInfo);
  }

  getEventEmitter() {
    return this.emitter;
  }

  private async getClient() {
    if (this.client && this.client.readyState === WebSocket.OPEN) {
      return this.client;
    }

    this.client = await MinecraftEmitter.getClient(this.connectionInfo);
    return this.client;
  }

  private async requestFromServer(rawCommand: string, ..._args: any[]) {
    const client = await this.getClient();
    return new Promise<CommandOutput>((resolve, reject) => {
      const command = rawCommand.trim();
      const requestId = randomUUID();

      const timeout = setTimeout(() => reject(), 5000);

      client.on('message', (data) => {
        const parsed = JSON.parse(data.toString());

        if (parsed.Identifier !== requestId) {
          return;
        }

        const commandResult = parsed.Message;
        clearTimeout(timeout);
        return resolve(new CommandOutput({ rawResult: commandResult }));
      });

      log.debug('requestFromServer - sending command', { command });
      client.send(
        JSON.stringify({
          Message: command,
          Identifier: requestId,
          Name: 'Takaro',
        }),
      );
    });
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayer', player);
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayers');
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayerLocation', player);
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    const start = Date.now();
    try {
      const data = await this.requestFromServer('TPS');
      // @ts-expect-error TODO, fix this properly :)
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

  // @ts-expect-error TODO, fix this properly :)
  async sendMessage(message: string, opts: IMessageOptsDTO) {
    return this.requestFromServer('sendMessage', message, opts);
  }

  // @ts-expect-error TODO, fix this properly :)
  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    return this.requestFromServer('teleportPlayer', player, x, y, z);
  }

  // @ts-expect-error TODO, fix this properly :)
  async kickPlayer(player: IGamePlayer, reason: string) {
    return this.requestFromServer('kickPlayer', player, reason);
  }

  // @ts-expect-error TODO, fix this properly :)
  async banPlayer(options: BanDTO) {
    return this.requestFromServer('banPlayer', options);
  }

  // @ts-expect-error TODO, fix this properly :)
  async unbanPlayer(player: IGamePlayer) {
    return this.requestFromServer('unbanPlayer', player);
  }

  async listBans(): Promise<BanDTO[]> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('listBans');
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality: number): Promise<void> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('giveItem', player, item, amount, quality);
  }

  async listItems(): Promise<IItemDTO[]> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('listItems');
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayerInventory', player);
  }

  async shutdown(): Promise<void> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('shutdown');
  }
}
