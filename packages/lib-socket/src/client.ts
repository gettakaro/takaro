import { Socket, io } from 'socket.io-client';
import { IServerToClientEvents } from './types.js';
import { logger } from '@takaro/util';

export type TakaroSocket = Socket<IServerToClientEvents, Record<string, never>>;

interface IOptions {
  timeout?: number;
  authToken?: string;
}

const defaultOptions: IOptions = {
  timeout: 5000,
};

const log = logger('lib-socket');

export async function getClient(
  url: string,
  rawOptions = defaultOptions
): Promise<TakaroSocket> {
  const options = {
    ...defaultOptions,
    ...rawOptions,
  };
  log.info(`Connecting to socket server at ${url}`);

  const socket: TakaroSocket = io(url, {
    extraHeaders: {
      Authorization: `Bearer ${options.authToken}`,
    },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      log.error('Socket connection timed out');
      socket.close();
      return reject(new Error('Socket connection timed out'));
    }, options.timeout);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
