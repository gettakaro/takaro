import { logger, traceableClass } from '@takaro/util';
import { IGamePlayer, IPosition } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  IGameServer,
  IItemDTO,
  IMessageOptsDTO,
  IPlayerReferenceDTO,
  MapInfoDTO,
  TestReachabilityOutputDTO,
} from '../../interfaces/GameServer.js';
import { Settings } from '@takaro/apiclient';
import { TakaroConnector } from './connectorClient.js';
import { GenericConnectionInfo } from './connectionInfo.js';
import { JsonObject } from 'type-fest';
import { GenericEmitter } from './emitter.js';

@traceableClass('game:generic')
export class Generic implements IGameServer {
  private logger = logger('Generic');
  connectionInfo: GenericConnectionInfo;
  emitter: GenericEmitter;
  private takaroConnector = new TakaroConnector();

  constructor(
    config: GenericConnectionInfo,
    private settings: Partial<Settings> = {},
    private gameServerId: string,
  ) {
    this.connectionInfo = config;
  }

  getEventEmitter() {
    return this.emitter;
  }

  private async requestFromServer(operation: string, data?: JsonObject) {
    if (!data) data = {};
    const resp = await this.takaroConnector.requestFromServer(this.gameServerId, operation, JSON.stringify(data));
    return resp.data;
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    return this.requestFromServer('getPlayer', player.toJSON());
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return this.requestFromServer('getPlayers');
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    return this.requestFromServer('getPlayerLocation', player.toJSON());
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    const isConnected = await this.takaroConnector.requestFromServer(this.gameServerId, 'testReachability', '{}');

    if (isConnected) {
      return new TestReachabilityOutputDTO({
        connectable: isConnected,
      });
    } else {
      return new TestReachabilityOutputDTO({
        connectable: isConnected,
        reason: 'Ensure server is running and has connected to Takaro to identify itself',
      });
    }
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    return this.requestFromServer('executeConsoleCommand', { command: rawCommand });
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    return this.requestFromServer('sendMessage', {
      message,
      ...opts.toJSON(),
    });
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    return this.requestFromServer('teleportPlayer', { ...player.toJSON(), x, y, z });
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    return this.requestFromServer('kickPlayer', { ...player.toJSON(), reason });
  }

  async banPlayer(options: BanDTO) {
    return this.requestFromServer('banPlayer', options.toJSON());
  }

  async unbanPlayer(player: IGamePlayer) {
    return this.requestFromServer('unbanPlayer', player.toJSON());
  }

  async listBans(): Promise<BanDTO[]> {
    return this.requestFromServer('listBans');
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality: string): Promise<void> {
    return this.requestFromServer('giveItem', { ...player.toJSON(), item, amount, quality });
  }

  async listItems(): Promise<IItemDTO[]> {
    return this.requestFromServer('listItems');
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    return this.requestFromServer('getPlayerInventory', player.toJSON());
  }

  async shutdown(): Promise<void> {
    return this.requestFromServer('shutdown');
  }

  async getMapInfo(): Promise<MapInfoDTO> {
    return new MapInfoDTO({
      enabled: false,
      mapBlockSize: 0,
      maxZoom: 0,
      mapSizeX: 0,
      mapSizeY: 0,
      mapSizeZ: 0,
    });
  }

  async getMapTile(_x: number, _y: number, _z: number): Promise<Buffer> {
    throw new Error('Not implemented');
  }
}
