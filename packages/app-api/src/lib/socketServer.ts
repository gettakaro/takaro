import { Server, Socket } from 'socket.io';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { config } from '../config.js';
import { ctx, errors, logger } from '@takaro/util';
import { EventPayload, EventTypes, HookEvents } from '@takaro/modules';
import { instrument } from '@socket.io/admin-ui';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { NextFunction, Response } from 'express';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from '@takaro/db';
import { EventOutputDTO } from '../service/EventService.js';
import { GameServerService } from '../service/GameServerService.js';

interface ServerToClientEvents {
  gameEvent: (gameserverId: string, type: EventTypes, data: EventPayload) => void;
  event: (event: EventOutputDTO) => void;
  pong: () => void;
  ready: (data: { domainId: string }) => void;
}

interface ClientToServerEvents {
  ping: () => void;
}

interface InterServerEvents {
  ping: () => void;
  event: (event: EventOutputDTO) => void;
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
      return authMiddleware(req as AuthenticatedRequest, res as Response, (err?: Error) => {
        // Store auth data in the request for socket handshake access
        // This ensures the data persists across the engine->socket middleware boundary
        if (!err) {
          const ctxData = ctx.data;
          (req as any).takaroAuth = {
            userId: ctxData.user,
            domainId: ctxData.domain,
          };
        }
        next(err);
      });
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

    this.io.on('event', (event: EventOutputDTO) => {
      const eventsToRefreshServerCache: EventTypes[] = [
        HookEvents.GAMESERVER_CREATED,
        HookEvents.GAMESERVER_DELETED,
        HookEvents.GAMESERVER_UPDATED,
      ];

      if (eventsToRefreshServerCache.includes(event.eventName)) {
        this.log.info(
          `Received event from other node that indicates we need to refresh cache for gameserver ${event.gameserverId}`,
        );
        const gameserverService = new GameServerService(event.domain);
        gameserverService.refreshGameInstance(event.gameserverId);
      }
    });

    this.log.info('Socket server started');
  }

  public async init() {
    const pubRedis = await Redis.getClient('socketio:pub');
    const subRedis = await Redis.getClient('socketio:sub');

    this.io.adapter(createAdapter(pubRedis, subRedis));

    // Add debug logging for Redis adapter events
    this.io.of('/').adapter.on('create-room', (room) => {
      this.log.debug('[CONCURRENT_TESTS_DEBUG] Redis adapter: room created', { room });
    });

    this.io.of('/').adapter.on('join-room', (room, id) => {
      this.log.debug('[CONCURRENT_TESTS_DEBUG] Redis adapter: socket joined room', { room, socketId: id });
    });

    this.io.of('/').adapter.on('leave-room', (room, id) => {
      this.log.debug('[CONCURRENT_TESTS_DEBUG] Redis adapter: socket left room', { room, socketId: id });
    });

    this.log.info('[CONCURRENT_TESTS_DEBUG] Redis adapter initialized and event listeners attached');
  }

  public emit(
    domainId: string,
    event: keyof ServerToClientEvents,
    data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]> = [],
  ) {
    const room = this.io.sockets.adapter.rooms.get(domainId);
    const connectedSocketsCount = room ? room.size : 0;

    this.log.debug('[CONCURRENT_TESTS_DEBUG] Emitting event to room', {
      domainId,
      eventType: event,
      connectedSocketsInRoom: connectedSocketsCount,
      totalConnectedSockets: this.io.sockets.sockets.size,
      eventData: event === 'event' ? (data[0] as any)?.eventName : undefined,
    });

    this.log.debug('[CONCURRENT_TESTS_DEBUG] About to emit via Redis adapter', {
      domainId,
      eventType: event,
      hasData: data.length > 0,
    });

    this.io.to(domainId).emit(event, ...data);

    this.log.debug('[CONCURRENT_TESTS_DEBUG] Emitted via Redis adapter', {
      domainId,
      eventType: event,
    });

    if (event === 'event') {
      this.log.debug('[CONCURRENT_TESTS_DEBUG] About to serverSideEmit', {
        domainId,
        eventName: (data[0] as any)?.eventName,
      });
      this.io.serverSideEmit(event, data[0] as unknown as EventOutputDTO);
      this.log.debug('[CONCURRENT_TESTS_DEBUG] serverSideEmit completed', {
        domainId,
        eventName: (data[0] as any)?.eventName,
      });
    }
  }

  private async routerMiddleware(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error | undefined) => void,
  ) {
    try {
      // Get auth data from the handshake request (stored by engine middleware)
      const authData = (socket.request as any).takaroAuth;

      if (!authData?.domainId) {
        this.log.error('No domain found in handshake auth data');
        return next(new errors.UnauthorizedError());
      }

      // Create a new AsyncLocalStorage context with auth data
      // The context from engine middleware doesn't propagate to socket middleware
      const wrappedHandler = ctx.wrap('socket:router', async () => {
        ctx.addData({ user: authData.userId, domain: authData.domainId });
        this.log.debug('[CONCURRENT_TESTS_DEBUG] Socket joining room', {
          socketId: socket.id,
          userId: authData.userId,
          domainId: authData.domainId,
          contextUser: ctx.data.user,
          contextDomain: ctx.data.domain,
        });
        await socket.join(authData.domainId);

        // Emit 'ready' event to client after room join completes
        // This ensures client knows the socket is truly in the domain room
        // and ready to receive events (fixes race condition with Redis adapter)
        socket.emit('ready', { domainId: authData.domainId });

        next();
      });

      await wrappedHandler();
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
