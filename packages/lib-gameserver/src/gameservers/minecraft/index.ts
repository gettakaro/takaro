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

export enum MINECRAFT_COMMANDS {
  LOGIN = 'LOGIN',
  EXEC = 'EXEC',
  PLAYERS = 'PLAYERS',
  TPS = 'TPS',
}

@traceableClass('game:minecraft')
export class Minecraft implements IGameServer {
  connectionInfo: MinecraftConnectionInfo;
  emitter: MinecraftEmitter;
  private client: WebSocket | null;
  private token: string | null = null;

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

    const { client, token } = await MinecraftEmitter.getClient(this.connectionInfo);
    this.client = client;
    this.token = token;
    return this.client;
  }

  private async requestFromServer(command: MINECRAFT_COMMANDS, params: any[] = []): Promise<Record<string, unknown>> {
    const client = await this.getClient();
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const requestId = randomUUID();

      const responseListener = (data: any) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.requestId !== requestId) {
          return;
        }

        clearTimeout(timeout);
        client.off('message', responseListener);
        return resolve(parsed);
      };

      const timeout = setTimeout(() => {
        client.off('message', responseListener);
        return reject();
      }, 5000);

      client.on('message', responseListener);

      if (!params.length) params = ['dummy'];

      const toSend = JSON.stringify({
        command,
        params,
        requestId,
        token: this.token,
      });
      log.debug('requestFromServer - sending command', { toSend });
      client.send(toSend);
    });
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayer', player);
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const response = await this.requestFromServer(MINECRAFT_COMMANDS.PLAYERS);
    assert(typeof response.players === 'string');
    const players = JSON.parse(response.players);

    return players.map(
      (p: any) =>
        new IGamePlayer({
          gameId: p.uuid,
          ping: p.ping,
          name: p.name,
          platformId: p.uuid,
          ip: p.ip,
        }),
    );
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('getPlayerLocation', player);
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    const start = Date.now();
    try {
      const data = await this.requestFromServer(MINECRAFT_COMMANDS.TPS);
      // assert that data.message is a string
      assert(typeof data.message === 'string');
      // Assert that it matches 'xx.x ticks'
      assert(data.message.match(/\d+\.\d+ ticks/));
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
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('executeConsoleCommand', rawCommand);
  }

  // @ts-expect-error TODO, fix this properly :)
  async sendMessage(message: string, opts: IMessageOptsDTO) {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('sendMessage', message, opts);
  }

  // @ts-expect-error TODO, fix this properly :)
  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('teleportPlayer', player, x, y, z);
  }

  // @ts-expect-error TODO, fix this properly :)
  async kickPlayer(player: IGamePlayer, reason: string) {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('kickPlayer', player, reason);
  }

  // @ts-expect-error TODO, fix this properly :)
  async banPlayer(options: BanDTO) {
    // @ts-expect-error TODO, fix this properly :)
    return this.requestFromServer('banPlayer', options);
  }

  // @ts-expect-error TODO, fix this properly :)
  async unbanPlayer(player: IGamePlayer) {
    // @ts-expect-error TODO, fix this properly :)
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