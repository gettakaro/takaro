import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { config } from '../config';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import {
  GameEvents,
  EventPlayerConnected,
  BaseEvent,
  EventChatMessage,
} from '@takaro/gameserver';
import { getSocketServer } from '../lib/socketServer';
import { HookService } from '../service/HookService';
import { PlayerService } from '../service/PlayerService';
import { CommandService } from '../service/CommandService';

const log = logger('worker:events');

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), processJob);
  }
}

function isConnectedEvent(a: BaseEvent<unknown>): a is EventPlayerConnected {
  return a.type === GameEvents.PLAYER_CONNECTED;
}

function isChatMessageEvent(a: BaseEvent<unknown>): a is EventChatMessage {
  return a.type === GameEvents.CHAT_MESSAGE;
}

async function processJob(job: Job<IEventQueueData>) {
  log.info('Processing an event', job.data);

  const { type, event, domainId, gameServerId } = job.data;

  if (isConnectedEvent(event)) {
    const playerService = new PlayerService(domainId);
    await playerService.sync(event.player, gameServerId);
  }

  if (isChatMessageEvent(event)) {
    const commandService = new CommandService(domainId);
    await commandService.handleChatMessage(event, gameServerId);
  }

  const hooksService = new HookService(domainId);
  await hooksService.handleEvent(event, gameServerId);

  const socketServer = getSocketServer();
  socketServer.emit(domainId, 'gameEvent', [type, event]);
}
