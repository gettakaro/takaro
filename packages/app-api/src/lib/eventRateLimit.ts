import { logger } from '@takaro/util';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { Redis } from '@takaro/db';
import { DomainService } from '../service/DomainService.js';
import { EventCreateDTO, EventService, EVENT_TYPES } from '../service/EventService.js';
import { TakaroEventRateLimitExceeded, GameEvents } from '@takaro/modules';

const log = logger('eventRateLimit');

// Rate limiting cache
const rateLimiters = new Map<string, RateLimiterRedis>();
const domainConfigCache = new Map<string, { config: any; expires: number }>();

// Redis keys for rate limit event tracking
const RATE_LIMIT_EVENT_KEY_PREFIX = 'rateLimitEvent:';
const RATE_LIMIT_EVENT_TTL = 60 * 60; // 1 hour in seconds

export async function shouldCreateRateLimitEvent(gameServerId: string, eventType: string): Promise<boolean> {
  const redis = await Redis.getClient('events:rateLimit');
  const key = `${RATE_LIMIT_EVENT_KEY_PREFIX}${gameServerId}:${eventType}`;

  // Use atomic SET NX EX operation - sets key only if it doesn't exist
  // Returns 'OK' if set successfully, null if key already exists
  const result = await redis.set(key, Date.now().toString(), {
    NX: true,
    EX: RATE_LIMIT_EVENT_TTL,
  });
  return result === 'OK';
}

export async function getDomainConfig(domainId: string) {
  const cached = domainConfigCache.get(domainId);
  if (cached && cached.expires > Date.now()) {
    return cached.config;
  }

  const domainService = new DomainService();
  const domain = await domainService.findOne(domainId);
  domainConfigCache.set(domainId, {
    config: domain,
    expires: Date.now() + 5 * 60 * 1000,
  });
  return domain;
}

export function clearDomainConfigCache(domainId: string) {
  domainConfigCache.delete(domainId);
  // Also clear any related rate limiters
  const keysToRemove = Array.from(rateLimiters.keys()).filter((key) => key.startsWith(`${domainId}:`));
  keysToRemove.forEach((key) => rateLimiters.delete(key));
}

export async function createRateLimitEvent(
  domainId: string,
  gameServerId: string,
  eventType: string,
  rateLimitPerMinute: number,
): Promise<void> {
  const eventService = new EventService(domainId);

  const rateLimitEvent = new TakaroEventRateLimitExceeded({
    eventType,
    rateLimitPerMinute,
  });

  await eventService.create(
    new EventCreateDTO({
      eventName: EVENT_TYPES.RATE_LIMIT_EXCEEDED,
      gameserverId: gameServerId,
      meta: rateLimitEvent,
    }),
  );
}

export function getEventRateLimit(domain: any, eventType: string): number | null {
  switch (eventType) {
    case GameEvents.LOG_LINE:
      return domain.eventRateLimitLogLine;
    case GameEvents.CHAT_MESSAGE:
      return domain.eventRateLimitChatMessage;
    case GameEvents.PLAYER_CONNECTED:
      return domain.eventRateLimitPlayerConnected;
    case GameEvents.PLAYER_DISCONNECTED:
      return domain.eventRateLimitPlayerDisconnected;
    case GameEvents.PLAYER_DEATH:
      return domain.eventRateLimitPlayerDeath;
    case GameEvents.ENTITY_KILLED:
      return domain.eventRateLimitEntityKilled;
    default:
      return null;
  }
}

export async function getRateLimiter(domainId: string, eventType: string): Promise<RateLimiterRedis | null> {
  const key = `${domainId}:${eventType}`;

  // Check if we have a cached limiter
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  // Get domain config (with caching)
  const domain = await getDomainConfig(domainId);

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

export async function checkRateLimit(domainId: string, gameServerId: string, eventType: string): Promise<boolean> {
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

      // Check if we should create a rate limit event
      if (await shouldCreateRateLimitEvent(gameServerId, eventType)) {
        const domain = await getDomainConfig(domainId);
        const rateLimitPerMinute = getEventRateLimit(domain, eventType);

        await createRateLimitEvent(domainId, gameServerId, eventType, rateLimitPerMinute || 0);
      }

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
