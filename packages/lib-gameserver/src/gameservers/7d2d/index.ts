import { logger } from '@takaro/util';
import { IGamePlayer } from '../../interfaces/GamePlayer.js';
import {
  CommandOutput,
  IGameServer,
  IPlayerReferenceDTO,
  IPosition,
  TestReachabilityOutput,
} from '../../interfaces/GameServer.js';
import { SevenDaysToDieEmitter } from './emitter.js';
import { SdtdApiClient } from './sdtdAPIClient.js';

import axios from 'axios';
import { SdtdConnectionInfo } from './connectionInfo.js';

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
    this.logger.debug('getPlayer', player);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getPlayerLocation(player: IGamePlayer): Promise<IPosition | null> {
    const locations = await this.apiClient.getPlayersLocation();
    const playerLocation = locations.data.find(
      (location) => location.steamid === `Steam_${player.steamId}`
    );

    if (!playerLocation) {
      return null;
    }

    return {
      x: playerLocation.position.x,
      y: playerLocation.position.y,
      z: playerLocation.position.z,
    };
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
          if (
            error.response?.status === 403 ||
            error.response?.status === 401
          ) {
            reason =
              'Unauthorized, please check that the admin user and token are correct';
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

  async sendMessage(message: string) {
    const command = `say "${message}"`;
    await this.apiClient.executeConsoleCommand(command);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    const command = `teleportplayer ${player.gameId} ${x} ${y} ${z}`;
    await this.apiClient.executeConsoleCommand(command);
  }
}
