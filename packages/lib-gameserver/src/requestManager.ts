import { JsonObject } from 'type-fest';
import WebSocket from 'ws';
import { errors } from '@takaro/logger';

type WSEvent =
  | 'open'
  | 'connection'
  | 'message'
  | 'upgrade'
  | 'close'
  | 'disconnect';

export class RequestManager {
  private ws: WebSocket | null = null;
  private options: any;
  constructor(opts = {}) {
    this.options = Object.assign({ timeout: 90000 }, opts);
    this.ws = new WebSocket('');
  }

  public send(event: WSEvent, data: JsonObject) {
    return new Promise((resolve, reject) => {
      this.ws?.emit(event, { data }, (res) => {
        clearTimeout(timeout);
        this.ws?.removeListener('disconnect', onDisconnect);
        if (res.error) return reject(res.error);
        resolve(res.data);
      });

      const onDisconnect = () => {
        clearTimeout(timeout);
        reject(new errors.TakaroError('disconnect'));
      };

      const timeout = setTimeout(() => {
        this.ws?.removeListener('disconnect', onDisconnect);
        reject(
          new errors.WsTimeoutError(`Exceeded ${this.options.timeout} (msec)`)
        );
      });
    });
  }
}
