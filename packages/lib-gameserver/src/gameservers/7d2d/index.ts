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
import { SevenDaysToDieEmitter } from './emitter.js';
import { SdtdApiClient } from './sdtdAPIClient.js';

import axios from 'axios';
import { SdtdConnectionInfo } from './connectionInfo.js';

@traceableClass('game:7d2d')
export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');
  private apiClient: SdtdApiClient;
  connectionInfo: SdtdConnectionInfo;

  constructor(config: SdtdConnectionInfo) {
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

  async giveItem(player: IPlayerReferenceDTO, item: IItemDTO): Promise<void> {
    const command = `give ${player.gameId} ${item.name} ${item.amount}`;
    await this.apiClient.executeConsoleCommand(command);
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    try {
      await this.apiClient.getStats();
      await this.apiClient.executeConsoleCommand('version');
    } catch (error) {
      let reason = 'Unexpected error, this might be a bug';
      this.logger.warn('Reachability test requests failed', error);

      if (axios.isAxiosError(error)) {
        reason = 'Network error';

        if (!error.response) {
          reason =
            'Did not receive a response, please check that the server is running, the IP/port is correct and that it is not firewalled';
        } else {
          if (error.response?.status === 403 || error.response?.status === 401) {
            reason = 'Unauthorized, please check that the admin user and token are correct';
          }
        }
      }

      return new TestReachabilityOutput().construct({
        connectable: false,
        reason,
      });
    }

    return new TestReachabilityOutput().construct({
      connectable: true,
    });
  }

  async executeConsoleCommand(rawCommand: string) {
    const result = await this.apiClient.executeConsoleCommand(rawCommand);

    return new CommandOutput().construct({
      rawResult: result.data.result,
      success: true,
    });
  }

  async sendMessage(message: string, opts?: IMessageOptsDTO) {
    let command = `say "${message}"`;

    if (opts?.recipient?.gameId) {
      command = `sayplayer "${opts.recipient.gameId}" "${message}"}`;
    }

    await this.apiClient.executeConsoleCommand(command);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    const command = `teleportplayer ${player.gameId} ${x} ${y} ${z}`;
    await this.apiClient.executeConsoleCommand(command);
  }

  async kickPlayer(player: IPlayerReferenceDTO, reason: string) {
    const command = `kick "${player.gameId}" "${reason}"`;
    await this.apiClient.executeConsoleCommand(command);
  }

  async banPlayer(options: BanDTO) {
    const command = `ban add ${options.player.gameId} ${options.expiresAt} ${options.reason}`;
    await this.apiClient.executeConsoleCommand(command);
  }

  async unbanPlayer(player: IPlayerReferenceDTO) {
    const command = `ban remove ${player.gameId}`;
    await this.apiClient.executeConsoleCommand(command);
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
}
