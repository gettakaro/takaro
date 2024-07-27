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
  gameEvent: (type: GameEventTypes, name: string, data: EventPayload) => void;
  [GameEvents.LOG_LINE]: (line: Partial<EventLogLine> & { name: string }) => void;
  [GameEvents.CHAT_MESSAGE]: (message: Partial<EventChatMessage> & { name: string }) => void;
  [GameEvents.PLAYER_CONNECTED]: (player: Partial<EventPlayerConnected> & { name: string }) => void;
  [GameEvents.PLAYER_DISCONNECTED]: (player: Partial<EventPlayerDisconnected> & { name: string }) => void;
  [GameEvents.PLAYER_DEATH]: (player: Partial<EventPlayerDeath> & { name: string }) => void;
  [GameEvents.ENTITY_KILLED]: (player: Partial<EventEntityKilled> & { name: string }) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  getPlayer: (id: string, callback: (e: Awaited<ReturnType<IMockGameServer['getPlayer']>>) => void) => Promise<void>;
  teleportPlayer: (
    player: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number,
    callback: (e: Awaited<ReturnType<IMockGameServer['teleportPlayer']>>) => void,
  ) => Promise<void>;
  ping: (callback: (e: string) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export type MockServerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

export type MockServerSocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
