import { Job } from 'bullmq';
import { logger } from '@takaro/logger';
import { config } from '../config';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import {
  GameEvents,
  EventMapping,
  EventPlayerConnected,
  BaseEvent,
} from '@takaro/gameserver';
import { getSocketServer } from '../lib/socketServer';
import { HookService } from '../service/HookService';
import { QueuesService } from '@takaro/queues';
import { AuthService } from '../service/AuthService';
import { FunctionService } from '../service/FunctionService';
import { PlayerOutputDTO, PlayerService } from '../service/PlayerService';

const log = logger('worker:events');
const queues = QueuesService.getInstance();

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), processJob);
  }
}

async function processJob(job: Job<IEventQueueData>) {
  log.info('Processing an event', job.data);

  await syncPlayerData(job);
  //await handleHooks(job.data);

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

function isConnectedEvent(a: BaseEvent): a is EventPlayerConnected {
  return a.type === GameEvents.PLAYER_CONNECTED;
}

async function syncPlayerData(job: Job<IEventQueueData>) {
  if (isConnectedEvent(job.data.data)) {
    const playerData = job.data.data.player;
    const playerService = new PlayerService(job.data.domainId);
    let player: PlayerOutputDTO;

    const existingAssociations = await playerService.findAssociations(
      playerData.gameId
    );

    if (!existingAssociations.length) {
      const existingPlayers = await playerService.find({
        filters: {
          steamId: playerData.steamId,
          epicOnlineServicesId: playerData.epicOnlineServicesId,
          xboxLiveId: playerData.xboxLiveId,
        },
      });

      if (!existingPlayers.length) {
        // Main player profile does not exist yet!
        player = await playerService.create({
          name: playerData.name,
          epicOnlineServicesId: playerData.epicOnlineServicesId,
          steamId: playerData.steamId,
          xboxLiveId: playerData.xboxLiveId,
        });
      } else {
        player = existingPlayers[0];
      }

      await playerService.insertAssociation(
        playerData.gameId,
        player.id,
        job.data.gameServerId
      );
    }
  }
}
