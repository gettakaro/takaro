import { logger } from '@takaro/util';
import { Redis } from '@takaro/db';
import { DiscordErrorHandler } from './DiscordErrorHandler.js';

const log = logger('DiscordRateLimiter');

/**
 * Discord API rate limiter with exponential backoff
 */
export class DiscordRateLimiter {
  private static readonly RATE_LIMIT_KEY_PREFIX = 'discord:rateLimit';
  private static readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private static readonly BASE_DELAY = 1000; // 1 second
  private static readonly MAX_DELAY = 30000; // 30 seconds

  /**
   * Executes a Discord API operation with rate limiting and retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      guildId?: string;
      channelId?: string;
      userId?: string;
    },
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    } = {},
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_RETRY_ATTEMPTS,
      baseDelay = this.BASE_DELAY,
      maxDelay = this.MAX_DELAY,
    } = options;

    const { operationName, guildId, channelId, userId } = context;

    log.debug(`Executing Discord operation: ${operationName}`, {
      guildId,
      channelId,
      userId,
      maxRetries,
    });

    let lastError: any;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        // Check if we're currently rate limited
        if (attempt > 0) {
          const isRateLimited = await this.isRateLimited(guildId);
          if (isRateLimited) {
            const delay = await this.getRateLimitDelay(guildId);
            log.info(`Rate limited, waiting ${delay}ms before retry`, {
              operationName,
              guildId,
              attempt,
              delay,
            });
            await this.sleep(delay);
          }
        }

        // Execute the operation
        const result = await operation();

        // Success - clear any rate limit flags
        if (attempt > 0) {
          await this.clearRateLimit(guildId);
          log.info(`Discord operation succeeded after ${attempt} retries`, {
            operationName,
            guildId,
            attempts: attempt,
          });
        } else {
          log.debug(`Discord operation succeeded`, {
            operationName,
            guildId,
          });
        }

        return result;
      } catch (error: any) {
        lastError = error;
        attempt++;

        // Log the error with appropriate context
        DiscordErrorHandler.logError(error, {
          operationName,
          guildId,
          channelId,
          userId,
          attempt,
          maxRetries,
        });

        // Check if this is a retryable error
        if (!DiscordErrorHandler.isRetryableError(error)) {
          log.debug(`Non-retryable error, failing immediately`, {
            operationName,
            guildId,
            attempt,
            errorCode: error.code,
          });
          throw DiscordErrorHandler.mapDiscordError(error);
        }

        // If we've exhausted retries, throw the mapped error
        if (attempt > maxRetries) {
          log.warn(`Discord operation failed after ${maxRetries} retries`, {
            operationName,
            guildId,
            attempts: attempt - 1,
            finalError: error.message,
          });
          throw DiscordErrorHandler.mapDiscordError(error);
        }

        // Handle rate limiting
        if (error.code === 429) {
          const retryDelay = DiscordErrorHandler.getRetryDelay(error);
          await this.setRateLimit(guildId, retryDelay);

          log.info(`Rate limited by Discord API, will retry after ${retryDelay}ms`, {
            operationName,
            guildId,
            attempt,
            retryDelay,
          });

          await this.sleep(retryDelay);
          continue;
        }

        // Calculate exponential backoff delay
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000, // Add jitter
          maxDelay,
        );

        log.info(`Discord operation failed, retrying in ${delay}ms`, {
          operationName,
          guildId,
          attempt,
          maxRetries,
          delay,
          errorCode: error.code,
        });

        await this.sleep(delay);
      }
    }

    // This should never be reached, but just in case
    throw DiscordErrorHandler.mapDiscordError(lastError);
  }

  /**
   * Checks if a guild is currently rate limited
   */
  private static async isRateLimited(guildId?: string): Promise<boolean> {
    if (!guildId) return false;

    try {
      const redisClient = await Redis.getClient('discord:rateLimiter');
      const key = `${this.RATE_LIMIT_KEY_PREFIX}:${guildId}`;
      const result = await redisClient.get(key);
      return result !== null;
    } catch (error) {
      log.warn('Failed to check rate limit status', { guildId, error });
      return false;
    }
  }

  /**
   * Gets the remaining rate limit delay for a guild
   */
  private static async getRateLimitDelay(guildId?: string): Promise<number> {
    if (!guildId) return 0;

    try {
      const redisClient = await Redis.getClient('discord:rateLimiter');
      const key = `${this.RATE_LIMIT_KEY_PREFIX}:${guildId}`;
      const ttl = await redisClient.pTTL(key);
      return Math.max(ttl, 0);
    } catch (error) {
      log.warn('Failed to get rate limit delay', { guildId, error });
      return 0;
    }
  }

  /**
   * Sets a rate limit for a guild
   */
  private static async setRateLimit(guildId?: string, delayMs: number = this.BASE_DELAY): Promise<void> {
    if (!guildId) return;

    try {
      const redisClient = await Redis.getClient('discord:rateLimiter');
      const key = `${this.RATE_LIMIT_KEY_PREFIX}:${guildId}`;
      await redisClient.set(key, 'true', { PX: delayMs });

      log.debug('Set rate limit for guild', { guildId, delayMs });
    } catch (error) {
      log.warn('Failed to set rate limit', { guildId, delayMs, error });
    }
  }

  /**
   * Clears the rate limit for a guild
   */
  private static async clearRateLimit(guildId?: string): Promise<void> {
    if (!guildId) return;

    try {
      const redisClient = await Redis.getClient('discord:rateLimiter');
      const key = `${this.RATE_LIMIT_KEY_PREFIX}:${guildId}`;
      await redisClient.del(key);

      log.debug('Cleared rate limit for guild', { guildId });
    } catch (error) {
      log.warn('Failed to clear rate limit', { guildId, error });
    }
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wraps a Discord API operation with automatic retry and rate limiting
   */
  static withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    context: {
      guildId?: string;
      channelId?: string;
      userId?: string;
    } = {},
  ) {
    return this.executeWithRetry(operation, { operationName, ...context });
  }
}
