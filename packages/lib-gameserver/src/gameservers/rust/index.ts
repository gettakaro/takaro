import { logger, traceableClass } from '@takaro/util';
import WebSocket from 'ws';
import { IGamePlayer, IPosition } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  IGameServer,
  IItemDTO,
  IPlayerReferenceDTO,
  MapInfoDTO,
  TestReachabilityOutputDTO,
} from '../../interfaces/GameServer.js';
import { RustConnectionInfo } from './connectionInfo.js';
import { RustEmitter } from './emitter.js';
import { Settings } from '@takaro/apiclient';

const itemsJson = (await import('./items-rust.json', { assert: { type: 'json' } })).default;

@traceableClass('game:rust')
export class Rust implements IGameServer {
  private log = logger('rust');
  connectionInfo: RustConnectionInfo;
  private client: WebSocket | null;

  constructor(
    config: RustConnectionInfo,
    private settings: Partial<Settings> = {},
  ) {
    this.connectionInfo = config;
  }

  private getRequestId(): number {
    return Math.floor(Math.random() * 100000000);
  }

  private async getClient() {
    if (this.client && this.client.readyState === WebSocket.OPEN) {
      return this.client;
    }

    this.client = await RustEmitter.getClient(this.connectionInfo);
    return this.client;
  }

  getEventEmitter() {
    const emitter = new RustEmitter(this.connectionInfo);
    return emitter;
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const players = await this.getPlayers();
    return players.find((p) => p.gameId === player.gameId) || null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const response = await this.executeConsoleCommand('playerlist');
    const rustPlayers = JSON.parse(response.rawResult);
    return Promise.all(
      rustPlayers.map((player: any) => {
        return new IGamePlayer({
          gameId: player.SteamID,
          steamId: player.SteamID,
          ip: player.Address.split(':')[0],
          name: player.DisplayName,
          ping: player.Ping,
        });
      }),
    );
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number = 1, _quality?: string): Promise<void> {
    await this.executeConsoleCommand(`inventory.giveid ${player.gameId} ${item} ${amount}`);
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    const rawResponse = await this.executeConsoleCommand('playerlistpos');
    const lines = rawResponse.rawResult.split('\n');

    for (const line of lines) {
      const matches = /(\d{17}) \w+\s+\(([-\d\.]+), ([-\d\.]+), ([-\d\.]+)\)/.exec(line);

      if (matches) {
        const steamId = matches[1];
        const x = matches[2].replace('(', '');
        const y = matches[3].replace(',', '');
        const z = matches[4].replace(')', '');

        if (steamId === player.gameId) {
          return {
            x: parseInt(x, 10),
            y: parseInt(y, 10),
            z: parseInt(z, 10),
          };
        }
      }
    }

    return null;
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    const start = Date.now();
    try {
      await this.executeConsoleCommand('serverinfo');
      const end = Date.now();
      return new TestReachabilityOutputDTO({ connectable: true, latency: end - start });
    } catch (error) {
      this.log.warn('testReachability', error);
      return new TestReachabilityOutputDTO({ connectable: false });
    }
  }

  async executeConsoleCommand(rawCommand: string) {
    const client = await this.getClient();
    return new Promise<CommandOutput>((resolve, reject) => {
      const command = rawCommand.trim();
      const requestId = this.getRequestId();

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

      this.log.debug('executeConsoleCommand - sending command', { command });
      client.send(
        JSON.stringify({
          Message: command,
          Identifier: requestId,
          Name: 'Takaro',
        }),
      );
    });
  }

  async sendMessage(message: string) {
    await this.executeConsoleCommand(`say "${message}"`);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    await this.executeConsoleCommand(`teleportplayer.pos ${player.gameId} ${x} ${y} ${z}`);
  }

  async kickPlayer(player: IGamePlayer, reason: string) {
    await this.executeConsoleCommand(`kick "${player.gameId}" "${reason}"`);
  }

  async banPlayer(options: BanDTO) {
    // 'find banid'
    // Variables: Commands: global.banid( ) banid <steamid> <username> <reason> [optional duration]
    // This optional duration is an integer, seems to be hours.

    if (!options.expiresAt) {
      await this.executeConsoleCommand(`banid ${options.player.gameId} "" "${options.reason}"`);
      return;
    }

    const timeDiff = new Date(options.expiresAt).valueOf() - Date.now();
    const hours = Math.floor(timeDiff / 1000 / 60 / 60);

    await this.executeConsoleCommand(`banid ${options.player.gameId} "" "${options.reason}" ${hours}`);
  }

  async unbanPlayer(player: IPlayerReferenceDTO) {
    await this.executeConsoleCommand(`unban ${player.gameId}`);
  }

  async listBans(): Promise<BanDTO[]> {
    const response = await this.executeConsoleCommand('banlistex');

    if (!response.rawResult) {
      return [];
    }

    const lines = response.rawResult.split('\n');
    const pattern =
      /(?:'|^)(?<number>\d+)\s+(?<gameId>\d+)\s+"(?<username>.*?)"\s+"(?<reason>.*?)"\s+(?<expiration>-?\d+)\s*(?:'|\n|$)/g;
    const bans = [];

    for (const line of lines) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        if (!match.groups) {
          this.log.warn('listBans - line did not match regex', { match, line });
          continue;
        }
        const { gameId, expiration } = match.groups;

        let expiresAt = null;
        if (expiration !== '-1') {
          expiresAt = new Date(parseInt(expiration) * 1000).toISOString();
        }

        const ban = new BanDTO({
          reason: match.groups.reason,
          player: new IGamePlayer({
            gameId,
            steamId: gameId,
          }),
          expiresAt,
        });

        bans.push(ban);
      }
    }

    return bans;
  }

  async listItems(): Promise<IItemDTO[]> {
    return Promise.all(
      Object.values(itemsJson).map((item) => {
        return new IItemDTO({
          code: item.shortname,
          name: item.Name,
          description: item.Description,
        });
      }),
    );
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    const res = await this.executeConsoleCommand(`viewinventory ${player.gameId}`);
    const toParse = res.rawResult.replace('[ViewInventory] ', '');
    const parsed = JSON.parse(toParse);
    const items = JSON.parse(parsed.Inventory);
    return await Promise.all(items.map((i: any) => new IItemDTO({ code: i.itemName, amount: i.amount })));
  }

  async shutdown(): Promise<void> {
    await this.executeConsoleCommand('quit');
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
