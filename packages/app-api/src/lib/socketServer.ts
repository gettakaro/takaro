import { Server, Socket } from 'socket.io';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { config } from '../config.js';
import { ctx, errors, logger } from '@takaro/util';
import { EventPayload, EventTypes } from '@takaro/modules';
import { instrument } from '@socket.io/admin-ui';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { NextFunction, Response } from 'express';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from '@takaro/db';
import { EventOutputDTO } from '../service/EventService.js';

interface ServerToClientEvents {
  gameEvent: (gameserverId: string, type: EventTypes, data: EventPayload) => void;
  event: (event: EventOutputDTO) => void;
  pong: () => void;
}

interface ClientToServerEvents {
  ping: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

class SocketServer {
  public io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private log = logger('io');
  constructor(app: HttpServer) {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(app, {
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

    instrument(this.io, {
      auth: false,
    });

    this.io.use(
      (
        socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
        next: (err?: Error | undefined) => void,
      ) => this.logMiddleware(socket, next),
    );

    const authMiddleware = ctx.wrap('socket:auth', AuthService.getAuthMiddleware([]));
    this.io.engine.use((req: IncomingMessage, res: ServerResponse<IncomingMessage>, next: NextFunction) => {
      return authMiddleware(req as AuthenticatedRequest, res as Response, next);
    });

    this.io.use(
      (
        socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
        next: (err?: Error | undefined) => void,
      ) => this.routerMiddleware(socket, next),
    );

    this.io.on('connection', (socket) => {
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    this.log.info('Socket server started');
  }

  public async init() {
    const pubRedis = await Redis.getClient('socketio:pub');
    const subRedis = await Redis.getClient('socketio:sub');

    this.io.adapter(createAdapter(pubRedis, subRedis));
  }

  public emit(
    domainId: string,
    event: keyof ServerToClientEvents,
    data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]> = [],
  ) {
    this.io.to(domainId).emit(event, ...data);
  }

  private async routerMiddleware(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error | undefined) => void,
  ) {
    try {
      const ctxData = ctx.data;
      if (!ctxData.domain) {
        this.log.error('No domain found in context');
        return next(new errors.UnauthorizedError());
      }
      await socket.join(ctxData.domain);
      next();
    } catch (error) {
      this.log.error('Unknown error when routing socket', error);
      next(new errors.UnauthorizedError());
    }
  }

  private logMiddleware(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error | undefined) => void,
  ) {
    this.log.info('socket connected', {
      id: socket.id,
      address: socket.handshake.address,
      url: socket.handshake.url,
      secure: socket.handshake.secure,
    });
    next();
  }
}

let cachedSocketServer: SocketServer | null = null;

export const getSocketServer = async (app?: HttpServer) => {
  if (!cachedSocketServer) {
    if (!app) {
      logger('getSocketServer').error('Socket server not initialized, must provide HttpServer instance');
      throw new errors.InternalServerError();
    }
    cachedSocketServer = new SocketServer(app);
    await cachedSocketServer.init();
  }

  return cachedSocketServer;
};
