import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config';
import { errors, logger } from '@takaro/logger';
import { GameEvents, EventMapping } from '@takaro/gameserver';
import { instrument } from '@socket.io/admin-ui';
import { AuthService } from '../service/AuthService';

interface ServerToClientEvents {
  gameEvent: (type: GameEvents, data: EventMapping[GameEvents]) => void;
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
  public io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private log = logger('io');
  constructor(app: HttpServer) {
    this.io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(app, {
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
        socket: Socket<
          ClientToServerEvents,
          ServerToClientEvents,
          InterServerEvents,
          SocketData
        >,
        next: (err?: Error | undefined) => void
      ) => this.logMiddleware(socket, next)
    );
    this.io.use(
      (
        socket: Socket<
          ClientToServerEvents,
          ServerToClientEvents,
          InterServerEvents,
          SocketData
        >,
        next: (err?: Error | undefined) => void
      ) => this.authMiddleware(socket, next)
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

  private async authMiddleware(
    socket: Socket<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >,
    next: (err?: Error | undefined) => void
  ) {
    try {
      let token = null;

      if (socket.handshake.headers.cookie) {
        const parsedCookies: Record<string, string> =
          socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=');
            return { ...acc, [key.trim()]: decodeURIComponent(value) };
          }, {});

        token = parsedCookies[config.get('auth.cookieName')];
      }

      if (socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) return next(new errors.UnauthorizedError());

      const payload = await AuthService.verifyJwt(token);

      socket.join(payload.domainId);
      this.log.warn('TODO: Implement auth for io server :)' + token);
      next();
    } catch (error) {
      this.log.error('Unknown error when authenticating socket', error);
      next(new errors.UnauthorizedError());
    }
  }

  private logMiddleware(
    socket: Socket<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >,
    next: (err?: Error | undefined) => void
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
