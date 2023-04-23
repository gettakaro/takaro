import { GameEvents, EventMapping } from '@takaro/gameserver';
import { Socket, Server } from 'socket.io';

export interface ServerToClientEvents {
  gameEvent: (
    gameserverId: string,
    type: GameEvents,
    data: EventMapping[GameEvents]
  ) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export type MockServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>;

export type MockServerSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>;
