import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../../config.js';
import { errors, logger } from '@takaro/util';
import { MockServerSocketServer } from './socketTypes.js';
import { getMockServer, IMockGameServer } from '../gameserver/index.js';

class SocketServer {
  public io: MockServerSocketServer;
  private log = logger('io');

  private supportedMethods: Array<keyof IMockGameServer> = [
    'getPlayer',
    'getPlayers',
    'getPlayerLocation',
    'executeConsoleCommand',
    'sendMessage',
    'giveItem',
    'teleportPlayer',
    'kickPlayer',
    'banPlayer',
    'unbanPlayer',
    'listBans',
    'listItems',
    'getPlayerInventory',
  ];

  constructor(app: HttpServer) {
    this.io = new Server(app, {
      cors: {
        credentials: true,
        origin: (origin: string | undefined, callback: CallableFunction) => {
          const allowedOrigins = config.get('http.allowedOrigins') ?? [];
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new errors.BadRequestError('Not allowed by CORS'));
          }
        },
      },
    });

    this.io.on('connection', async (socket) => {
      const name = socket.handshake.query.name as string;
      const instance = await getMockServer(name);

      this.log.info(`New connection for ${name}: ${socket.id}`);
      socket.onAny(async (event: keyof IMockGameServer | 'ping', name, ...args) => {
        const instance = await getMockServer(name);
        this.log.verbose(`Event: ${event}`);

        if (event === 'ping') {
          args[args.length - 1]('pong');
          return;
        }

        // Checking if the event is supported helps prevent attacks
        // Because the socket would accept any event name here, it could lead to prototype pollution
        if (this.supportedMethods.includes(event)) {
          // @ts-expect-error This method allows us to bypass a lot of boiler plate code
          // But TS does not like this (for good reason)
          // Making the exception here because this is a mock server...
          const result = await instance[event](...args);
          this.log.verbose('Result', { result });
          args[args.length - 1](result);
        } else {
          this.log.warn(`Event ${event} not found`);
          args[args.length - 1](new Error(`Event ${event} not found`));
        }
      });

      await instance.ensurePlayersPersisted();
    });

    this.log.info('Socket server started');
  }
}

let cachedSocketServer: SocketServer | null = null;

export const getSocketServer = (app?: HttpServer) => {
  if (!cachedSocketServer) {
    if (!app) {
      logger('getSocketServer').error('Socket server not initialized, must provide HttpServer instance');
      throw new errors.InternalServerError();
    }
    cachedSocketServer = new SocketServer(app);
  }

  return cachedSocketServer;
};
