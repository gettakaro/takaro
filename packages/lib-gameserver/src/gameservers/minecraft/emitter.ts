import { logger, errors } from '@takaro/util';
import { MinecraftConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import WebSocket from 'ws';
import { MINECRAFT_COMMANDS } from './index.js';

const log = logger('minecraft:emitter');
export class MinecraftEmitter extends TakaroEmitter {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  constructor(private config: MinecraftConnectionInfo) {
    super();
  }

  static async getClient(config: MinecraftConnectionInfo) {
    const protocol = config.useTls ? 'wss' : 'ws';
    const client = new WebSocket(`${protocol}://${config.host}`);

    log.debug('getClient', {
      host: config.host,
    });

    return Promise.race([
      new Promise<{ client: WebSocket; token: string }>((resolve, reject) => {
        client?.on('error', (err) => {
          log.warn('getClient', err);
          client?.close();
          return reject(err);
        });
        client?.on('unexpected-response', (req, res) => {
          log.debug('unexpected-response', {
            req,
            res,
          });
          reject(new errors.InternalServerError());
        });
        client?.on('open', () => {
          log.debug('Connection opened');

          const loginResponseListener = (data: any) => {
            const parsed = JSON.parse(data.toString());
            if (parsed.statusDescription === 'LoggedIn' && parsed.token) {
              client.off('message', loginResponseListener);
              return resolve({ client, token: parsed.token });
            }
          };

          client.on('message', loginResponseListener);
          client.send(JSON.stringify({ command: MINECRAFT_COMMANDS.LOGIN, params: config.password }));
        });
      }),
      new Promise<{ client: WebSocket; token: string }>((_, reject) => {
        setTimeout(() => reject(new errors.WsTimeOutError('Timeout')), 5000);
      }),
    ]);
  }

  async start(): Promise<void> {
    const { client, token } = await MinecraftEmitter.getClient(this.config);
    this.ws = client;
    this.token = token;

    this.ws?.on('message', (m: Buffer) => {
      this.listener(m.toString());
    });
  }

  async stop(): Promise<void> {
    this.ws?.close();
    log.debug('Websocket connection has been closed');
    return;
  }

  private async listener(e: any) {
    const parsed = JSON.parse(e);
    log.debug('Received message', { message: parsed });
  }
}
