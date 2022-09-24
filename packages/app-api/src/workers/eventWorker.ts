import { Job } from 'bullmq';
import { logger } from '@takaro/logger';
import { config } from '../config';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import { GameEvents, EventMapping } from '@takaro/gameserver';
import { getSocketServer } from '../lib/socketServer';
import { HookService } from '../service/HookService';
import { QueuesService } from '@takaro/queues';
import { AuthService } from '../service/AuthService';
import { FunctionService } from '../service/FunctionService';

const log = logger('worker:events');
const queues = QueuesService.getInstance();

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), processJob);
  }
}

async function processJob(job: Job<IEventQueueData>) {
  log.info('Processing an event', job.data);

  await handleHooks(job.data);

  const socketServer = getSocketServer();
  socketServer.emit(job.data.domainId, 'gameEvent', [
    job.data.type,
    job.data.data,
  ]);
}

export async function handleHooks(eventData: IEventQueueData) {
  const triggeredHooks = await getTriggeredHooks(
    eventData.domainId,
    eventData.data
  );

  log.debug(`Found ${triggeredHooks.length} hooks that match the event`);

  if (triggeredHooks.length) {
    const authService = new AuthService(eventData.domainId);
    const token = await authService.getAgentToken();

    await Promise.all(
      triggeredHooks.map(async (hook) => {
        const functionsService = new FunctionService(eventData.domainId);
        const relatedFunctions = await functionsService.getRelatedFunctions(
          hook.id,
          true
        );

        return queues.queues.hooks.queue.add(hook.id, {
          itemId: hook.id,
          data: eventData.data,
          domainId: eventData.domainId,
          functions: relatedFunctions as string[],
          token,
        });
      })
    );
  }
}

async function getTriggeredHooks(
  domainId: string,
  data: EventMapping[GameEvents]
) {
  const hookService = new HookService(domainId);
  const hooksThatMatchType = await hookService.find({
    filters: { eventType: data.type },
  });

  return hooksThatMatchType.filter((hook) => {
    const hookRegex = new RegExp(hook.regex);
    const hookRegexMatches = hookRegex.exec(data.msg);
    return hookRegexMatches;
  });
}
