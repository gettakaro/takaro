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
import { SevenDaysToDieEmitter } from './emitter.js';
import { SdtdApiClient } from './sdtdAPIClient.js';
import { Settings } from '@takaro/apiclient';

import { SdtdConnectionInfo } from './connectionInfo.js';
import { InventoryItem } from './apiResponses.js';
import { Worker } from 'worker_threads';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

@traceableClass('game:7d2d')
export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');
  private apiClient: SdtdApiClient;
  connectionInfo: SdtdConnectionInfo;

  constructor(config: SdtdConnectionInfo, private settings: Partial<Settings> = {}) {
    this.connectionInfo = config;
    this.apiClient = new SdtdApiClient(this.connectionInfo);
  }

  getEventEmitter() {
    const emitter = new SevenDaysToDieEmitter(this.connectionInfo);
    return emitter;
  }

  async getPlayer(player: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const players = await this.getPlayers();
    return players.find((p) => p.gameId === player.gameId) || null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const onlinePlayersRes = await this.apiClient.getOnlinePlayers();

    const players = await Promise.all(
      onlinePlayersRes.data.map((p) => {
        return new IGamePlayer().construct({
          gameId: p.crossplatformid.replace('EOS_', ''),
          ip: p.ip,
          name: p.name,
          steamId: p.steamid.replace('Steam_', ''),
          epicOnlineServicesId: p.crossplatformid,
          platformId: p.steamid.replace('Steam_', ''),
          ping: p.ping,
        });
      })
    );

    return players;
  }

  async steamIdOrXboxToGameId(id: string): Promise<IGamePlayer | undefined> {
    if (id.startsWith('Steam_')) id = id.replace('Steam_', '');
    if (id.startsWith('XBL_')) id = id.replace('XBL_', '');
    const players = await this.getPlayers();
    const player = players.find((p) => p.steamId === id || p.epicOnlineServicesId === id);
    return player;
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    const locations = await this.apiClient.getPlayersLocation();
    const playerLocation = locations.data.find((location) => location.crossplatformid === `EOS_${player.gameId}`);

    if (!playerLocation) {
      return null;
    }

    return {
      x: playerLocation.position.x,
      y: playerLocation.position.y,
      z: playerLocation.position.z,
    };
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number): Promise<void> {
    if (this.connectionInfo.useCPM) {
      const command = `giveplus EOS_${player.gameId} ${item} ${amount}`;
      await this.executeConsoleCommand(command);
    } else {
      const command = `give EOS_${player.gameId} ${item} ${amount}`;
      await this.executeConsoleCommand(command);
    }
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000));

      await Promise.race([this.apiClient.getStats(), timeout]);
      await Promise.race([this.executeConsoleCommand('version'), timeout]);
    } catch (error) {
      let reason = 'Unexpected error, this might be a bug';
      this.logger.warn('Reachability test requests failed', error);

      if (error instanceof Object && 'details' in error) {
        reason =
          'Did not receive a response, please check that the server is running, the IP/port is correct and that it is not firewalled';
        console.log(error);
        if (error.details instanceof Object) {
          if ('status' in error.details) {
            if (error.details.status === 403 || error.details.status === 401) {
              reason = 'Unauthorized, please check that the admin user and token are correct';
            }
          }
        }
      } else if (error instanceof Object && 'message' in error && error.message === 'Request timed out') {
        reason = 'Request timed out, the server did not respond in the allocated time';
      }

      return new TestReachabilityOutputDTO().construct({
        connectable: false,
        reason,
      });
    }

    return new TestReachabilityOutputDTO().construct({
      connectable: true,
    });
  }

  async executeConsoleCommand(rawCommand: string) {
    const encodedCommand = encodeURIComponent(rawCommand);
    const result = await this.apiClient.executeConsoleCommand(encodedCommand);

    return new CommandOutput().construct({
      rawResult: result.data.result,
      success: true,
    });
  }

  async sendMessage(message: string, opts?: IMessageOptsDTO) {
    // eslint-disable-next-line quotes
    const escapedMessage = message.replaceAll(/"/g, "'");

    let command = `say "${escapedMessage}"`;

    if (opts?.recipient?.gameId) {
      command = `sayplayer "EOS_${opts.recipient.gameId}" "${escapedMessage}"`;
    }

    if (this.connectionInfo.useCPM) {
      const sender = this.settings.serverChatName || 'Takaro';
      command = `say2 "${sender}" "${escapedMessage}"`;

      if (opts?.recipient?.gameId) {
        command = `pm2 "${sender}" "EOS_${opts.recipient.gameId}" "${escapedMessage}"`;
      }
    }

    await this.executeConsoleCommand(command);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    const command = `teleportplayer EOS_${player.gameId} ${x} ${y} ${z}`;
    await this.executeConsoleCommand(command);
  }

  async kickPlayer(player: IPlayerReferenceDTO, reason: string) {
    const command = `kick "EOS_${player.gameId}" "${reason}"`;
    await this.executeConsoleCommand(command);
  }

  async banPlayer(options: BanDTO) {
    const command = `ban add EOS_${options.player.gameId} ${options.expiresAt} ${options.reason}`;
    await this.executeConsoleCommand(command);
  }

  async unbanPlayer(player: IPlayerReferenceDTO) {
    const command = `ban remove EOS_${player.gameId}`;
    await this.executeConsoleCommand(command);
  }

  async listBans(): Promise<BanDTO[]> {
    // Execute the console command and get the raw result.
    const bansRes = await this.executeConsoleCommand('ban list');

    // Check if the command was successful and if there is a raw result.
    if (!bansRes.success || !bansRes.rawResult) {
      throw new Error('Failed to retrieve ban list.');
    }

    // Extract and parse the bans from the raw result.
    const banEntries = bansRes.rawResult.split('\n').slice(1); // Skip the header line
    const bans: BanDTO[] = [];

    for (const entry of banEntries) {
      const match = entry.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (\S+) \(([^)]*)\) - (.*)/);

      // If the entry is valid, extract the details and push to the bans array.
      if (match) {
        const [, date, gameId, _displayName, reason] = match;
        const expiresAt = date.replace(' ', 'T') + '.000Z'; // Keep the time in its original form
        bans.push(
          await new BanDTO().construct({
            player: await new IPlayerReferenceDTO().construct({
              gameId,
            }),
            reason,
            expiresAt,
          })
        );
      }
    }

    return bans;
  }

  async listItems(): Promise<IItemDTO[]> {
    const itemsRes = await this.executeConsoleCommand('li *');
    const itemLines = itemsRes.rawResult.split('\n').slice(0, -2);

    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'itemWorker.js');

      const worker = new Worker(workerPath);
      worker.postMessage(itemLines);

      worker.on('message', (parsedItems) => {
        if (parsedItems.error) {
          reject(parsedItems.error);
        } else {
          resolve(parsedItems);
        }
        worker.terminate();
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    const inventoryRes = await this.apiClient.getPlayerInventory(`EOS_${player.gameId}`);
    const resp: IItemDTO[] = [];

    const mapSdtdItemToDto = async (item: InventoryItem | null) => {
      if (!item) return null;
      return new IItemDTO().construct({ code: item.name, amount: item.count });
    };

    const dtos = await Promise.all([
      ...inventoryRes.data.bag.map(mapSdtdItemToDto),
      ...inventoryRes.data.belt.map(mapSdtdItemToDto),
    ]);

    const filteredDTOs = dtos.filter((item) => item !== null) as IItemDTO[];
    resp.push(...filteredDTOs);

    for (const slot in inventoryRes.data.equipment) {
      if (Object.prototype.hasOwnProperty.call(inventoryRes.data.equipment, slot)) {
        const element = inventoryRes.data.equipment[slot];
        if (element) resp.push(await new IItemDTO().construct({ code: element.name, amount: element.count }));
      }
    }

    return resp;
  }
}
