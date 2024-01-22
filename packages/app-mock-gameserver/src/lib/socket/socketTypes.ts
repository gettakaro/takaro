import { IPlayerReferenceDTO } from '@takaro/gameserver';

import {
  GameEvents,
  EventLogLine,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventPlayerDeath,
  EventEntityKilled,
  GameEventTypes,
  EventPayload,
} from '@takaro/modules';
import { Socket, Server } from 'socket.io';
import { IMockGameServer } from '../gameserver/index.js';

export interface ServerToClientEvents {
  gameEvent: (type: GameEventTypes, data: EventPayload) => void;
  [GameEvents.LOG_LINE]: (line: EventLogLine) => void;
  [GameEvents.CHAT_MESSAGE]: (message: EventChatMessage) => void;
  [GameEvents.PLAYER_CONNECTED]: (player: EventPlayerConnected) => void;
  [GameEvents.PLAYER_DISCONNECTED]: (player: EventPlayerDisconnected) => void;
  [GameEvents.PLAYER_DEATH]: (player: EventPlayerDeath) => void;
  [GameEvents.ENTITY_KILLED]: (player: EventEntityKilled) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  getPlayer: (id: string, callback: (e: Awaited<ReturnType<IMockGameServer['getPlayer']>>) => void) => Promise<void>;
  teleportPlayer: (
    player: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number,
    callback: (e: Awaited<ReturnType<IMockGameServer['teleportPlayer']>>) => void
  ) => Promise<void>;
  ping: (callback: (e: string) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export type MockServerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

export type MockServerSocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
