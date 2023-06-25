import { Job } from 'bullmq';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import {
  GameEvents,
  EventPlayerConnected,
  BaseGameEvent,
  EventChatMessage,
} from '@takaro/modules';
import { getSocketServer } from '../lib/socketServer.js';
import { HookService } from '../service/HookService.js';
import { PlayerService } from '../service/PlayerService.js';
import { CommandService } from '../service/CommandService.js';

const log = logger('worker:events');

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(
      config.get('queues.events.name'),
      config.get('queues.events.concurrency'),
      processJob
    );
  }
}

function isConnectedEvent(
  a: BaseGameEvent<unknown>
): a is EventPlayerConnected {
  return a.type === GameEvents.PLAYER_CONNECTED;
}

function isChatMessageEvent(a: BaseGameEvent<unknown>): a is EventChatMessage {
  return a.type === GameEvents.CHAT_MESSAGE;
}

async function processJob(job: Job<IEventQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });
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

  const socketServer = await getSocketServer();
  socketServer.emit(domainId, 'gameEvent', [gameServerId, type, event]);
}
