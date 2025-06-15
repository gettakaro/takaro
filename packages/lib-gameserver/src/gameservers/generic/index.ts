import { errors, logger, traceableClass } from '@takaro/util';
import { IGamePlayer, IPosition } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  IEntityDTO,
  IGameServer,
  IItemDTO,
  ILocationDTO,
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
    this.emitter = new GenericEmitter(config);
  }

  getEventEmitter() {
    return this.emitter;
  }

  private async requestFromServer(operation: string, data?: JsonObject) {
    if (!data) data = {};
    const resp = await this.takaroConnector.requestFromServer(this.gameServerId, operation, JSON.stringify(data));

    if (resp && resp.error) {
      throw new errors.BadRequestError(`Error from server: ${resp.error}`);
    }

    return resp;
  }

  async getPlayer(rawPlayer: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const player = new IPlayerReferenceDTO({ gameId: rawPlayer.gameId });
    const res = await this.requestFromServer('getPlayer', player.toJSON());
    if (!res) return null;
    const dto = new IGamePlayer(res);
    await dto.validate();
    return dto;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const res = await this.requestFromServer('getPlayers');
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto: IGamePlayer[] = res.map((p: any) => new IGamePlayer(p));
    await Promise.all(dto.map((p) => p.validate()));
    return dto;
  }

  async getPlayerLocation(rawPlayer: IPlayerReferenceDTO): Promise<IPosition | null> {
    const player = new IPlayerReferenceDTO({ gameId: rawPlayer.gameId });
    const res = await this.requestFromServer('getPlayerLocation', player.toJSON());
    if (!res) return null;
    const dto = new IPosition(res);
    await dto.validate();
    return dto;
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    try {
      const response = await this.takaroConnector.requestFromServer(this.gameServerId, 'testReachability', '{}');
      const dto = new TestReachabilityOutputDTO(response);
      await dto.validate();
      return dto;
    } catch (error) {
      return new TestReachabilityOutputDTO({
        connectable: false,
        reason: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    const res = await this.requestFromServer('executeConsoleCommand', { command: rawCommand });
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto = new CommandOutput(res);
    await dto.validate();
    return dto;
  }

  async sendMessage(message: string, opts?: IMessageOptsDTO) {
    if (!opts) opts = new IMessageOptsDTO();
    await this.requestFromServer('sendMessage', {
      message,
      opts: opts.toJSON(),
    });
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number, dimension?: string) {
    await this.requestFromServer('teleportPlayer', { player: player.toJSON(), x, y, z, dimension });
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    await this.requestFromServer('kickPlayer', { player: player.toJSON(), reason });
  }

  async banPlayer(options: BanDTO) {
    await this.requestFromServer('banPlayer', options.toJSON());
  }

  async unbanPlayer(player: IGamePlayer) {
    await this.requestFromServer('unbanPlayer', player.toJSON());
  }

  async listBans(): Promise<BanDTO[]> {
    const res = await this.requestFromServer('listBans');
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto: BanDTO[] = res.map((p: any) => new BanDTO(p));
    await Promise.all(dto.map((p) => p.validate()));
    return dto;
  }

  async giveItem(rawPlayer: IPlayerReferenceDTO, item: string, amount: number, quality: string): Promise<void> {
    await this.requestFromServer('giveItem', {
      player: { gameId: rawPlayer.gameId },
      item,
      amount,
      quality,
    });
  }

  async listItems(): Promise<IItemDTO[]> {
    const res = await this.requestFromServer('listItems');
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto: IItemDTO[] = res.map((p: any) => new IItemDTO(p));
    await Promise.all(dto.map((p) => p.validate()));
    return dto;
  }

  async getPlayerInventory(rawPlayer: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    const player = new IPlayerReferenceDTO({ gameId: rawPlayer.gameId });
    const res = await this.requestFromServer('getPlayerInventory', player.toJSON());
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto: IItemDTO[] = res.map((p: any) => new IItemDTO(p));
    await Promise.all(dto.map((p) => p.validate()));
    return dto;
  }

  async shutdown(): Promise<void> {
    await this.requestFromServer('shutdown');
  }

  async getMapInfo(): Promise<MapInfoDTO> {
    const res = await this.requestFromServer('getMapInfo');
    if (!res)
      throw new errors.ValidationError('Nothing returned from server, is the server responding the right data?');
    const dto = new MapInfoDTO(res);
    await dto.validate();
    return dto;
  }

  async getMapTile(_x: number, _y: number, _z: number): Promise<string> {
    const res = await this.requestFromServer('getMapTile', { x: _x, y: _y, z: _z });
    return res;
  }

  async listEntities(): Promise<IEntityDTO[]> {
    throw new errors.NotImplementedError();
  }

  async listLocations(): Promise<ILocationDTO[]> {
    throw new errors.NotImplementedError();
  }
}
