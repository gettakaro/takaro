import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../../config.js';
import { ctx, errors, logger } from '@takaro/util';
import {
  MockServerSocket,
  MockServerSocketServer,
  ServerToClientEvents,
} from './socketTypes.js';

class SocketServer {
  public io: MockServerSocketServer;
  private log = logger('io');
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

    this.io.use(
      (socket: MockServerSocket, next: (err?: Error | undefined) => void) =>
        this.routerMiddleware(socket, next)
    );

    this.io.on('connection', (socket) => {
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    this.log.info('Socket server started');
  }

  public emit(
    domainId: string,
    event: keyof ServerToClientEvents,
    data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]> = []
  ) {
    this.io.to(domainId).emit(event, ...data);
  }

  private async routerMiddleware(
    socket: MockServerSocket,
    next: (err?: Error | undefined) => void
  ) {
    try {
      const ctxData = ctx.data;
      if (!ctxData.domain) {
        this.log.error('No domain found in context');
        return next(new errors.UnauthorizedError());
      }
      socket.join(ctxData.domain);
      next();
    } catch (error) {
      this.log.error('Unknown error when routing socket', error);
      next(new errors.UnauthorizedError());
    }
  }
}

let cachedSocketServer: SocketServer | null = null;

export const getSocketServer = (app?: HttpServer) => {
  if (!cachedSocketServer) {
    if (!app) {
      logger('getSocketServer').error(
        'Socket server not initialized, must provide HttpServer instance'
      );
      throw new errors.InternalServerError();
    }
    cachedSocketServer = new SocketServer(app);
  }

  return cachedSocketServer;
};
