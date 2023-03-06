import { logger, TakaroDTO } from '@takaro/util';
import { IsString, IsBoolean } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer.js';
import {
  CommandOutput,
  IGameServer,
  TestReachabilityOutput,
} from '../../interfaces/GameServer.js';
import { SevenDaysToDieEmitter } from './emitter.js';
import { SdtdApiClient } from './sdtdAPIClient.js';

import axios from 'axios';

export class SdtdConnectionInfo extends TakaroDTO<SdtdConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsString()
  public readonly adminUser!: string;
  @IsString()
  public readonly adminToken!: string;
  @IsBoolean()
  public readonly useTls!: boolean;
}
export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');
  private apiClient: SdtdApiClient;
  connectionInfo: SdtdConnectionInfo;

  constructor(config: SdtdConnectionInfo) {
    this.connectionInfo = config;
    this.apiClient = new SdtdApiClient(this.connectionInfo);
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  getEventEmitter() {
    const emitter = new SevenDaysToDieEmitter(this.connectionInfo);
    return emitter;
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
}
