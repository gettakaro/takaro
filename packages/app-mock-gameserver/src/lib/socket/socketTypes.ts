import {
  GameEvents,
  EventMapping,
  IPlayerReferenceDTO,
  EventLogLine,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
} from '@takaro/gameserver';
import { Socket, Server } from 'socket.io';
import { IMockGameServer } from '../gameserver/index.js';

export interface ServerToClientEvents {
  gameEvent: (type: GameEvents, data: EventMapping[GameEvents]) => void;
  [GameEvents.LOG_LINE]: (line: EventLogLine) => void;
  [GameEvents.CHAT_MESSAGE]: (message: EventChatMessage) => void;
  [GameEvents.PLAYER_CONNECTED]: (player: EventPlayerConnected) => void;
  [GameEvents.PLAYER_DISCONNECTED]: (player: EventPlayerDisconnected) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  getPlayer: (
    id: string,
    callback: (e: Awaited<ReturnType<IMockGameServer['getPlayer']>>) => void
  ) => Promise<void>;
  teleportPlayer: (
    player: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number,
    callback: (
      e: Awaited<ReturnType<IMockGameServer['teleportPlayer']>>
    ) => void
  ) => Promise<void>;
  ping: (callback: (e: string) => void) => void;
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
