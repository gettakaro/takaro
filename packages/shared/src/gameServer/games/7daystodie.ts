import SdtdApi from '7daystodie-api-wrapper';

import { Player } from '../../database/entity/player.entity';
import { GameServer } from './base';


export class SevenDaysToDie implements GameServer {

  async executeRawCommand(input: string) {
    const { command, result } = await SdtdApi.executeConsoleCommand(this.getAPIConfig(), input);
    return {
      input: command,
      output: result,
    };
  }

  async fetchOnlinePlayers(): Promise<Player[]> {
      const onlinePlayers = await SdtdApi.getOnlinePlayers(this.getAPIConfig());
      return Promise.all(onlinePlayers.map(player => Player.findOrCreate(player)));
  }


  private getAPIConfig() {
    return {
      ip: '192.168.1.100',
      port: '8082',
      adminUser: 'admin',
      adminToken: 'secret'
    };
  }

}

