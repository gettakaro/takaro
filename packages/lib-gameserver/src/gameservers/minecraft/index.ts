import { errors, logger, traceableClass } from '@takaro/util';
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

  async getPlayerLocation(_player: IPlayerReferenceDTO): Promise<IPosition | null> {
    throw new errors.NotImplementedError();
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
    const res = await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, [rawCommand]);
    return new CommandOutput({
      success: true,
      rawResult: JSON.stringify(res),
    });
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    if (opts && opts.recipient) {
      await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['tell', opts.recipient, message]);
    } else {
      await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['say', message]);
    }
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['teleport', player.gameId, `${x},${y},${z}`]);
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['kick', player.gameId, reason]);
  }

  async banPlayer(options: BanDTO) {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['ban', options.player.gameId, options.reason]);
  }

  async unbanPlayer(player: IGamePlayer) {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['pardon', player.gameId]);
  }

  async listBans(): Promise<BanDTO[]> {
    throw new errors.NotImplementedError();
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, _quality: string): Promise<void> {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['give', player.gameId, item, amount]);
  }

  async listItems(): Promise<IItemDTO[]> {
    throw new errors.NotImplementedError();
  }

  async getPlayerInventory(_player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    throw new errors.NotImplementedError();
  }

  async shutdown(): Promise<void> {
    await this.requestFromServer(MINECRAFT_COMMANDS.EXEC, ['stop']);
  }
}
