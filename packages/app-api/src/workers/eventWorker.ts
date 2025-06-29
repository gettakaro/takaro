import { Job } from 'bullmq';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import { EventChatMessage, EventEntityKilled, EventPlayerDeath, HookEvents } from '@takaro/modules';
import { getSocketServer } from '../lib/socketServer.js';
import { HookService } from '../service/HookService.js';
import { PlayerService } from '../service/Player/index.js';
import { CommandService } from '../service/CommandService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../service/EventService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';
import { GameServerService } from '../service/GameServerService.js';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { Redis } from '@takaro/db';
import { DomainService } from '../service/DomainService.js';

const log = logger('worker:events');

// Rate limiting cache
const rateLimiters = new Map<string, RateLimiterRedis>();
const domainConfigCache = new Map<string, { config: any; expires: number }>();

function getEventRateLimit(domain: any, eventType: string): number | null {
  switch (eventType) {
    case 'log':
      return domain.eventRateLimitLogLine;
    case 'chat-message':
      return domain.eventRateLimitChatMessage;
    case 'player-connected':
      return domain.eventRateLimitPlayerConnected;
    case 'player-disconnected':
      return domain.eventRateLimitPlayerDisconnected;
    case 'player-death':
      return domain.eventRateLimitPlayerDeath;
    case 'entity-killed':
      return domain.eventRateLimitEntityKilled;
    default:
      return null;
  }
}

async function getRateLimiter(domainId: string, eventType: string): Promise<RateLimiterRedis | null> {
  const key = `${domainId}:${eventType}`;

  // Check if we have a cached limiter
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  // Get domain config (with caching)
  let domain;
  const cached = domainConfigCache.get(domainId);
  if (cached && cached.expires > Date.now()) {
    domain = cached.config;
  } else {
    const domainService = new DomainService();
    domain = await domainService.findOne(domainId);
    // Cache for 5 minutes
    domainConfigCache.set(domainId, {
      config: domain,
      expires: Date.now() + 5 * 60 * 1000,
    });
  }

  const pointsPerMinute = getEventRateLimit(domain, eventType);
  if (!pointsPerMinute) return null;

  // Create new rate limiter
  const redis = await Redis.getClient('events:rateLimit');
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: `eventRL:`,
    points: pointsPerMinute,
    duration: 60, // 1 minute window
  });

  rateLimiters.set(key, limiter);
  return limiter;
}

async function checkRateLimit(domainId: string, gameServerId: string, eventType: string): Promise<boolean> {
  const limiter = await getRateLimiter(domainId, eventType);
  if (!limiter) return true; // No limit configured

  try {
    const key = `${domainId}:${gameServerId}:${eventType}`;
    await limiter.consume(key);
    return true;
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      log.warn('Rate limit exceeded, dropping event', {
        domain: domainId,
        gameServer: gameServerId,
        eventType,
        msBeforeNext: err.msBeforeNext,
      });
      return false;
    }
    throw err;
  }
}

// Clean up old rate limiters every 10 minutes
setInterval(
  () => {
    rateLimiters.clear();
    domainConfigCache.clear();
  },
  10 * 60 * 1000,
);

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

  const { type, event, domainId, gameServerId } = job.data;

  // Check rate limit
  const canProcess = await checkRateLimit(domainId, gameServerId, type);

  if (!canProcess) {
    // Just drop the event and return successfully
    log.debug(`Dropped ${type} event due to rate limit`);
    return;
  }

  const eventService = new EventService(domainId);

  if (type === HookEvents.LOG_LINE) {
    const hooksService = new HookService(domainId);
    await hooksService.handleEvent({
      eventType: HookEvents.LOG_LINE,
      eventData: event,
      gameServerId,
    });
  }

  const socketServer = await getSocketServer();
  socketServer.emit(domainId, 'gameEvent', [gameServerId, type, event]);

  if ('player' in event && event.player) {
    const playerService = new PlayerService(domainId);
    const gameServerService = new GameServerService(domainId);
    const playerOnGameServerService = new PlayerOnGameServerService(domainId);
    const { player, pog } = await playerService.resolveRef(event.player, gameServerId);

    await gameServerService.getPlayerLocation(gameServerId, player.id);

    if (type === HookEvents.CHAT_MESSAGE) {
      const chatMessage = event as EventChatMessage;
      const commandService = new CommandService(domainId);
      await commandService.handleChatMessage(chatMessage, gameServerId);

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
      await playerOnGameServerService.update(pog.id, new PlayerOnGameServerUpdateDTO({ online: true }));

      await eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.PLAYER_CONNECTED,
          gameserverId: gameServerId,
          playerId: player.id,
        }),
      );
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
