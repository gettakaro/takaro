import { Counter, Histogram, Gauge, register } from 'prom-client';
import { logger } from '@takaro/util';

const log = logger('DiscordMetrics');

/**
 * Discord API metrics for monitoring and observability
 */
export class DiscordMetrics {
  private static readonly METRICS_PREFIX = 'takaro_discord_';

  // API call counters
  static readonly apiCallsTotal = new Counter({
    name: `${this.METRICS_PREFIX}api_calls_total`,
    help: 'Total number of Discord API calls',
    labelNames: ['operation', 'guild_id', 'status', 'error_code'],
    registers: [register],
  });

  // API call duration histogram
  static readonly apiCallDuration = new Histogram({
    name: `${this.METRICS_PREFIX}api_call_duration_seconds`,
    help: 'Duration of Discord API calls in seconds',
    labelNames: ['operation', 'guild_id', 'status'],
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
  });

  // Rate limit metrics
  static readonly rateLimitHits = new Counter({
    name: `${this.METRICS_PREFIX}rate_limit_hits_total`,
    help: 'Total number of Discord API rate limit hits',
    labelNames: ['operation', 'guild_id'],
    registers: [register],
  });

  static readonly rateLimitDelay = new Histogram({
    name: `${this.METRICS_PREFIX}rate_limit_delay_seconds`,
    help: 'Time spent waiting due to rate limits in seconds',
    labelNames: ['operation', 'guild_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    registers: [register],
  });

  // Retry metrics
  static readonly retryAttempts = new Counter({
    name: `${this.METRICS_PREFIX}retry_attempts_total`,
    help: 'Total number of Discord API retry attempts',
    labelNames: ['operation', 'guild_id', 'attempt_number'],
    registers: [register],
  });

  static readonly operationFailures = new Counter({
    name: `${this.METRICS_PREFIX}operation_failures_total`,
    help: 'Total number of Discord API operation failures',
    labelNames: ['operation', 'guild_id', 'error_type', 'error_code'],
    registers: [register],
  });

  // Active connections and state
  static readonly activeOperations = new Gauge({
    name: `${this.METRICS_PREFIX}active_operations`,
    help: 'Number of currently active Discord API operations',
    labelNames: ['operation'],
    registers: [register],
  });

  // Message metrics
  static readonly messagesSent = new Counter({
    name: `${this.METRICS_PREFIX}messages_sent_total`,
    help: 'Total number of Discord messages sent',
    labelNames: ['guild_id', 'channel_id', 'has_embed'],
    registers: [register],
  });

  static readonly embedsSent = new Counter({
    name: `${this.METRICS_PREFIX}embeds_sent_total`,
    help: 'Total number of Discord embeds sent',
    labelNames: ['guild_id', 'channel_id'],
    registers: [register],
  });

  // Data fetching metrics
  static readonly rolesFetched = new Counter({
    name: `${this.METRICS_PREFIX}roles_fetched_total`,
    help: 'Total number of Discord roles fetched',
    labelNames: ['guild_id'],
    registers: [register],
  });

  static readonly channelsFetched = new Counter({
    name: `${this.METRICS_PREFIX}channels_fetched_total`,
    help: 'Total number of Discord channels fetched',
    labelNames: ['guild_id'],
    registers: [register],
  });

  // Role management metrics
  static readonly rolesAssigned = new Counter({
    name: `${this.METRICS_PREFIX}roles_assigned_total`,
    help: 'Total number of Discord roles assigned',
    labelNames: ['guild_id', 'user_id', 'role_id'],
    registers: [register],
  });

  static readonly rolesRemoved = new Counter({
    name: `${this.METRICS_PREFIX}roles_removed_total`,
    help: 'Total number of Discord roles removed',
    labelNames: ['guild_id', 'user_id', 'role_id'],
    registers: [register],
  });

  /**
   * Records the start of a Discord API operation
   */
  static startOperation(operation: string): () => void {
    this.activeOperations.inc({ operation });

    return () => {
      this.activeOperations.dec({ operation });
    };
  }

  /**
   * Records a successful Discord API call
   */
  static recordApiCall(
    operation: string,
    guildId: string | undefined,
    duration: number,
    status: 'success' | 'error' = 'success',
    errorCode?: string | number,
  ): void {
    const labels = {
      operation,
      guild_id: guildId || 'unknown',
      status,
      error_code: errorCode?.toString() || '',
    };

    this.apiCallsTotal.inc(labels);
    this.apiCallDuration.observe(
      { operation, guild_id: guildId || 'unknown', status },
      duration / 1000, // Convert to seconds
    );

    log.debug('Recorded Discord API call metric', {
      operation,
      guildId,
      duration,
      status,
      errorCode,
    });
  }

  /**
   * Records a rate limit hit
   */
  static recordRateLimit(operation: string, guildId: string | undefined, delayMs: number): void {
    const labels = {
      operation,
      guild_id: guildId || 'unknown',
    };

    this.rateLimitHits.inc(labels);
    this.rateLimitDelay.observe(labels, delayMs / 1000); // Convert to seconds

    log.debug('Recorded Discord rate limit metric', {
      operation,
      guildId,
      delayMs,
    });
  }

  /**
   * Records a retry attempt
   */
  static recordRetry(operation: string, guildId: string | undefined, attemptNumber: number): void {
    const labels = {
      operation,
      guild_id: guildId || 'unknown',
      attempt_number: attemptNumber.toString(),
    };

    this.retryAttempts.inc(labels);

    log.debug('Recorded Discord retry metric', {
      operation,
      guildId,
      attemptNumber,
    });
  }

  /**
   * Records an operation failure
   */
  static recordFailure(
    operation: string,
    guildId: string | undefined,
    errorType: string,
    errorCode?: string | number,
  ): void {
    const labels = {
      operation,
      guild_id: guildId || 'unknown',
      error_type: errorType,
      error_code: errorCode?.toString() || 'unknown',
    };

    this.operationFailures.inc(labels);

    log.debug('Recorded Discord failure metric', {
      operation,
      guildId,
      errorType,
      errorCode,
    });
  }

  /**
   * Records a message sent
   */
  static recordMessageSent(guildId: string | undefined, channelId: string, hasEmbed: boolean = false): void {
    const labels = {
      guild_id: guildId || 'unknown',
      channel_id: channelId,
      has_embed: hasEmbed.toString(),
    };

    this.messagesSent.inc(labels);

    if (hasEmbed) {
      this.embedsSent.inc({
        guild_id: guildId || 'unknown',
        channel_id: channelId,
      });
    }

    log.debug('Recorded Discord message sent metric', {
      guildId,
      channelId,
      hasEmbed,
    });
  }

  /**
   * Records roles fetched
   */
  static recordRolesFetched(guildId: string, count: number): void {
    const labels = {
      guild_id: guildId,
    };

    // Increment by the number of roles fetched
    for (let i = 0; i < count; i++) {
      this.rolesFetched.inc(labels);
    }

    log.debug('Recorded Discord roles fetched metric', {
      guildId,
      count,
    });
  }

  /**
   * Records channels fetched
   */
  static recordChannelsFetched(guildId: string, count: number): void {
    const labels = {
      guild_id: guildId,
    };

    // Increment by the number of channels fetched
    for (let i = 0; i < count; i++) {
      this.channelsFetched.inc(labels);
    }

    log.debug('Recorded Discord channels fetched metric', {
      guildId,
      count,
    });
  }

  /**
   * Records a role assignment
   */
  static recordRoleAssigned(guildId: string, userId: string, roleId: string): void {
    const labels = {
      guild_id: guildId,
      user_id: userId,
      role_id: roleId,
    };

    this.rolesAssigned.inc(labels);

    log.debug('Recorded Discord role assigned metric', {
      guildId,
      userId,
      roleId,
    });
  }

  /**
   * Records a role removal
   */
  static recordRoleRemoved(guildId: string, userId: string, roleId: string): void {
    const labels = {
      guild_id: guildId,
      user_id: userId,
      role_id: roleId,
    };

    this.rolesRemoved.inc(labels);

    log.debug('Recorded Discord role removed metric', {
      guildId,
      userId,
      roleId,
    });
  }

  /**
   * Creates a timer for measuring operation duration
   */
  static createTimer(operation: string, guildId?: string) {
    const startTime = Date.now();
    const endActiveOperation = this.startOperation(operation);

    return {
      end: (status: 'success' | 'error' = 'success', errorCode?: string | number) => {
        const duration = Date.now() - startTime;
        endActiveOperation();
        this.recordApiCall(operation, guildId, duration, status, errorCode);
        return duration;
      },
    };
  }

  /**
   * Wraps a Discord operation with automatic metrics collection
   */
  static async measureOperation<T>(operation: () => Promise<T>, operationName: string, guildId?: string): Promise<T> {
    const timer = this.createTimer(operationName, guildId);

    try {
      const result = await operation();
      timer.end('success');
      return result;
    } catch (error: any) {
      const errorCode = error.code || error.status || 'unknown';
      timer.end('error', errorCode);

      this.recordFailure(operationName, guildId, error.constructor.name, errorCode);

      throw error;
    }
  }
}
