import { Job } from 'bullmq';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { TakaroWorker } from '@takaro/queues';
import { IEventQueueData } from './dataDefinitions.js';
import { EventChatMessage, EventEntityKilled, EventPlayerDeath, HookEvents } from '@takaro/modules';
import { getSocketServer } from '../lib/socketServer.js';
import { HookService } from '../service/HookService.js';
import { PlayerService } from '../service/Player/index.js';
import { CommandService } from '../service/CommandService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../service/EventService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';
import { GameServerService } from '../service/GameServerService.js';

const log = logger('worker:events');

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), config.get('queues.events.concurrency'), processJob);
  }
}

async function processJob(job: Job<IEventQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
  });
  log.verbose('Processing an event', { data: job.data });
  log.debug('[CONCURRENT_TESTS_DEBUG] Worker received job', {
    jobId: job.id,
    domainId: job.data.domainId,
    gameServerId: job.data.gameServerId,
    eventType: job.data.type,
  });

  const { type, event, domainId, gameServerId } = job.data;

  const eventService = new EventService(domainId);

  if (type === HookEvents.LOG_LINE) {
    const hooksService = new HookService(domainId);
    hooksService
      .handleEvent({
        eventType: HookEvents.LOG_LINE,
        eventData: event,
        gameServerId,
      })
      .catch((err) => {
        log.error('Failed to handle log line event', { error: err, event });
      });
  }

  const socketServer = await getSocketServer();
  socketServer.emit(domainId, 'gameEvent', [gameServerId, type, event]);

  if ('player' in event && event.player) {
    const playerService = new PlayerService(domainId);
    const gameServerService = new GameServerService(domainId);
    const playerOnGameServerService = new PlayerOnGameServerService(domainId);

    log.debug('[CONCURRENT_TESTS_DEBUG] About to resolve player ref', {
      gameId: event.player.gameId,
      gameServerId,
      domainId,
    });

    const { player, pog } = await playerService.resolveRef(event.player, gameServerId);

    log.debug('[CONCURRENT_TESTS_DEBUG] Player ref resolved', {
      playerId: player.id,
      pogId: pog.id,
      playerName: player.name,
      domainId,
    });

    await gameServerService.getPlayerLocation(gameServerId, player.id);

    if (type === HookEvents.CHAT_MESSAGE) {
      const chatMessage = event as EventChatMessage;
      log.debug('Received chat message event, checking for commands', {
        player: chatMessage.player?.gameId,
        msgPreview: chatMessage.msg.substring(0, 50),
      });
      const commandService = new CommandService(domainId);
      await commandService.handleChatMessage(chatMessage, gameServerId);
      log.debug('Finished handling chat message for potential commands');

      await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.CHAT_MESSAGE,
          gameserverId: gameServerId,
          playerId: player.id,
          meta: chatMessage,
        }),
      );
    }

    if (type === EVENT_TYPES.PLAYER_CONNECTED) {
      log.debug('[CONCURRENT_TESTS_DEBUG] Handling PLAYER_CONNECTED event', {
        playerId: player.id,
        pogId: pog.id,
        gameServerId,
        domainId,
      });

      await playerOnGameServerService.update(pog.id, new PlayerOnGameServerUpdateDTO({ online: true }));

      await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.PLAYER_CONNECTED,
          gameserverId: gameServerId,
          playerId: player.id,
        }),
      );

      log.debug('[CONCURRENT_TESTS_DEBUG] PLAYER_CONNECTED event created');
    }

    if (type === EVENT_TYPES.PLAYER_DISCONNECTED) {
      await playerOnGameServerService.update(pog.id, new PlayerOnGameServerUpdateDTO({ online: false }));

      const createdEvent = await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.PLAYER_DISCONNECTED,
          gameserverId: gameServerId,
          playerId: player.id,
        }),
      );
      await playerOnGameServerService.handlePlaytimeIncrease(createdEvent);
    }

    if (type === EVENT_TYPES.PLAYER_DEATH) {
      const playerDeath = event as EventPlayerDeath;
      await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.PLAYER_DEATH,
          gameserverId: gameServerId,
          playerId: player.id,
          meta: new EventPlayerDeath(playerDeath),
        }),
      );
    }

    if (type === EVENT_TYPES.ENTITY_KILLED) {
      const entityKilled = event as EventEntityKilled;
      await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.ENTITY_KILLED,
          gameserverId: gameServerId,
          playerId: player.id,
          meta: new EventEntityKilled(entityKilled),
        }),
      );
    }
  }
}
