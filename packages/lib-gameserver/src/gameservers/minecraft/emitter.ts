import { logger, errors } from '@takaro/util';
import { MinecraftConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import WebSocket from 'ws';

const log = logger('minecraft:emitter');
export class MinecraftEmitter extends TakaroEmitter {
  private ws: WebSocket | null = null;
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
      new Promise<WebSocket>((resolve, reject) => {
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
          if (client) {
            return resolve(client);
          }
        });
      }),
      new Promise<WebSocket>((_, reject) => {
        setTimeout(() => reject(new errors.WsTimeOutError('Timeout')), 5000);
      }),
    ]);
  }

  async start(): Promise<void> {
    this.ws = await MinecraftEmitter.getClient(this.config);

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
    log.debug('mc-listener', e);
    log.debug(JSON.stringify(e));
  }
}
