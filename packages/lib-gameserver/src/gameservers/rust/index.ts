import { logger, errors } from '@takaro/util';
import WebSocket from 'ws';
import { IGamePlayer } from '../../interfaces/GamePlayer.js';
import {
  CommandOutput,
  IGameServer,
  IPlayerReferenceDTO,
  IPosition,
  TestReachabilityOutput,
} from '../../interfaces/GameServer.js';
import { RustConnectionInfo } from './connectionInfo.js';
import { RustEmitter } from './emitter.js';

export class Rust implements IGameServer {
  private log = logger('rust');
  connectionInfo: RustConnectionInfo;
  private client: WebSocket | null;

  constructor(config: RustConnectionInfo) {
    this.connectionInfo = config;
  }

  private getRequestId(): number {
    return Math.floor(Math.random() * 100000000);
  }

  private async getClient() {
    if (this.client && this.client.readyState === WebSocket.OPEN) {
      return this.client;
    }

    this.client = RustEmitter.constructWs(this.connectionInfo);

    this.log.debug('getClient', {
      host: this.connectionInfo.host,
      port: this.connectionInfo.rconPort,
    });

    return Promise.race([
      new Promise<WebSocket>((resolve, reject) => {
        this.client?.on('unexpected-response', (req, res) => {
          this.log.debug('unexpected-response', {
            req,
            res,
          });
          reject(new errors.InternalServerError());
        });
        this.client?.on('open', () => {
          this.log.debug('Connection opened');
          if (this.client) {
            return resolve(this.client);
          }
        });
        this.client?.on('error', (err) => {
          this.log.warn('getClient', err);
          reject(err);
        });
      }),
      new Promise<WebSocket>((_, reject) => {
        setTimeout(() => reject(new errors.WsTimeOutError('Timeout')), 5000);
      }),
    ]);
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

    return rustPlayers.map((player: any) => {
      return new IGamePlayer().construct({
        gameId: player.SteamID,
        steamId: player.SteamID,
        ip: player.Address,
        name: player.DisplayName,
      });
    });
  }

  async getPlayerLocation(_player: IGamePlayer): Promise<IPosition | null> {
    const rawResponse = await this.executeConsoleCommand('playerlistpos');
    const lines = rawResponse.rawResult.split('\n');

    for (const line of lines) {
      const matches =
        /(\d{17}) \w+\s{4}\(([-\d\.]+), ([-\d\.]+), ([-\d\.]+)\)/.exec(line);

      if (matches) {
        const steamId = matches[1];
        const x = matches[2].replace('(', '');
        const y = matches[3].replace(',', '');
        const z = matches[4].replace(')', '');

        if (steamId === _player.gameId) {
          return {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
          };
        }
      }
    }

    return null;
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    try {
      await this.executeConsoleCommand('serverinfo');
      return new TestReachabilityOutput().construct({ connectable: true });
    } catch (error) {
      this.log.warn('testReachability', error);
      return new TestReachabilityOutput().construct({ connectable: false });
    }
  }

  async executeConsoleCommand(rawCommand: string) {
    return new Promise<CommandOutput>(async (resolve, reject) => {
      const client = await this.getClient();
      const command = rawCommand.trim();
      const requestId = this.getRequestId();

      const timeout = setTimeout(() => reject(), 5000);

      client.on('message', (data) => {
        const parsed = JSON.parse(data.toString());

        if (parsed.Identifier !== requestId) {
          return;
        }

        console.log(parsed);
        let commandResult = '';

        try {
          commandResult = JSON.parse(parsed.Message);
        } catch (error) {
          // Silence the error, we can't parse the result with JSON
          // But maybe we can parse it later with regex
          commandResult = parsed.Message;
        }

        clearTimeout(timeout);
        return resolve(
          new CommandOutput().construct({ rawResult: commandResult })
        );
      });

      this.log.debug('executeConsoleCommand - sending command', { command });
      client.send(
        JSON.stringify({
          Message: command,
          Identifier: requestId,
          Name: 'Takaro',
        })
      );
    });
  }

  async sendMessage(message: string) {
    await this.executeConsoleCommand(`say "${message}"`);
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    throw new errors.NotImplementedError();
    console.log(`say "${player}" was teleported to ${x}, ${y}, ${z}`);
  }
}
