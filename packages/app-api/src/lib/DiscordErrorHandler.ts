import { errors, logger } from '@takaro/util';
import { DiscordAPIError } from 'discord.js';

const log = logger('DiscordErrorHandler');

/**
 * Discord API error codes
 * @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#http-status-codes
 */
export enum DiscordErrorCodes {
  // General errors
  GENERAL_ERROR = 0,
  UNKNOWN_ACCOUNT = 10001,
  UNKNOWN_APPLICATION = 10002,
  UNKNOWN_CHANNEL = 10003,
  UNKNOWN_GUILD = 10004,
  UNKNOWN_INTEGRATION = 10005,
  UNKNOWN_INVITE = 10006,
  UNKNOWN_MEMBER = 10007,
  UNKNOWN_MESSAGE = 10008,
  UNKNOWN_PERMISSION_OVERWRITE = 10009,
  UNKNOWN_PROVIDER = 10010,
  UNKNOWN_ROLE = 10011,
  UNKNOWN_TOKEN = 10012,
  UNKNOWN_USER = 10013,
  UNKNOWN_EMOJI = 10014,
  UNKNOWN_WEBHOOK = 10015,
  UNKNOWN_WEBHOOK_SERVICE = 10016,
  UNKNOWN_SESSION = 10020,
  UNKNOWN_BAN = 10026,
  UNKNOWN_SKU = 10027,
  UNKNOWN_STORE_LISTING = 10028,
  UNKNOWN_ENTITLEMENT = 10029,
  UNKNOWN_BUILD = 10030,
  UNKNOWN_LOBBY = 10031,
  UNKNOWN_BRANCH = 10032,
  UNKNOWN_STORE_DIRECTORY_LAYOUT = 10033,
  UNKNOWN_REDISTRIBUTABLE = 10036,
  UNKNOWN_GIFT_CODE = 10038,
  UNKNOWN_STREAM = 10049,
  UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN = 10050,
  UNKNOWN_GUILD_TEMPLATE = 10057,
  UNKNOWN_DISCOVERABLE_SERVER_CATEGORY = 10059,
  UNKNOWN_STICKER = 10060,
  UNKNOWN_INTERACTION = 10062,
  UNKNOWN_APPLICATION_COMMAND = 10063,
  UNKNOWN_VOICE_STATE = 10065,
  UNKNOWN_APPLICATION_COMMAND_PERMISSIONS = 10066,
  UNKNOWN_STAGE_INSTANCE = 10067,
  UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM = 10068,
  UNKNOWN_GUILD_WELCOME_SCREEN = 10069,
  UNKNOWN_GUILD_SCHEDULED_EVENT = 10070,
  UNKNOWN_GUILD_SCHEDULED_EVENT_USER = 10071,
  UNKNOWN_TAG = 10087,

  // Permission errors
  MISSING_ACCESS = 50001,
  INVALID_ACCOUNT_TYPE = 50002,
  CANNOT_EXECUTE_ACTION_ON_DM_CHANNEL = 50003,
  GUILD_WIDGET_DISABLED = 50004,
  CANNOT_EDIT_MESSAGE_BY_OTHER_USER = 50005,
  CANNOT_SEND_EMPTY_MESSAGE = 50006,
  CANNOT_SEND_MESSAGES_TO_USER = 50007,
  CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL = 50008,
  CHANNEL_VERIFICATION_LEVEL_TOO_HIGH = 50009,
  OAUTH2_APPLICATION_DOES_NOT_HAVE_BOT = 50010,
  OAUTH2_APPLICATION_LIMIT_REACHED = 50011,
  INVALID_OAUTH2_STATE = 50012,
  MISSING_PERMISSIONS = 50013,
  INVALID_AUTHENTICATION_TOKEN = 50014,
  NOTE_TOO_LONG = 50015,
  TOO_FEW_OR_TOO_MANY_MESSAGES_TO_DELETE = 50016,
  INVALID_MFA_LEVEL = 50017,
  MESSAGE_CAN_ONLY_BE_PINNED_IN_CHANNEL_IT_WAS_SENT_IN = 50019,
  INVITE_CODE_INVALID_OR_TAKEN = 50020,
  CANNOT_EXECUTE_ACTION_ON_SYSTEM_MESSAGE = 50021,
  CANNOT_EXECUTE_ACTION_ON_CHANNEL_TYPE = 50024,
  INVALID_OAUTH2_ACCESS_TOKEN = 50025,
  MISSING_REQUIRED_OAUTH2_SCOPE = 50026,
  INVALID_WEBHOOK_TOKEN = 50027,
  INVALID_ROLE = 50028,
  INVALID_RECIPIENTS = 50033,
  MESSAGE_TOO_OLD_TO_BULK_DELETE = 50034,
  INVALID_FORM_BODY = 50035,
  INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT = 50036,
  INVALID_ACTIVITY_ACTION = 50039,
  INVALID_API_VERSION = 50041,
  FILE_UPLOADED_EXCEEDS_MAXIMUM_SIZE = 50045,
  INVALID_FILE_UPLOADED = 50046,
  CANNOT_SELF_REDEEM_GIFT = 50054,
  INVALID_GUILD = 50055,
  INVALID_MESSAGE_TYPE = 50068,
  PAYMENT_SOURCE_REQUIRED = 50070,
  CANNOT_MODIFY_SYSTEM_WEBHOOK = 50073,
  CANNOT_DELETE_CHANNEL_REQUIRED_FOR_COMMUNITY_GUILDS = 50074,
  CANNOT_EDIT_STICKERS_WITHIN_MESSAGE = 50080,
  INVALID_STICKER_SENT = 50081,
  INVALID_ACTION_ON_ARCHIVED_THREAD = 50083,
  INVALID_THREAD_NOTIFICATION_SETTINGS = 50084,
  PARAMETER_EARLIER_THAN_CREATION = 50085,
  COMMUNITY_SERVER_CHANNELS_MUST_BE_TEXT_CHANNELS = 50086,
  EVENT_ENTITY_TYPE_DIFFERENT = 50091,
  SERVER_NOT_AVAILABLE_IN_YOUR_LOCATION = 50095,
  SERVER_NEEDS_MONETIZATION_ENABLED = 50097,
  SERVER_NEEDS_MORE_BOOSTS = 50101,
  REQUEST_BODY_CONTAINS_INVALID_JSON = 50109,
  OWNER_CANNOT_BE_PENDING_MEMBER = 50131,
  OWNERSHIP_CANNOT_BE_TRANSFERRED_TO_BOT_USER = 50132,
  FAILED_TO_RESIZE_ASSET = 50138,
  UPLOADED_FILE_NOT_FOUND = 50146,
  VOICE_MESSAGES_DO_NOT_SUPPORT_ADDITIONAL_CONTENT = 50159,
  VOICE_MESSAGES_MUST_HAVE_SINGLE_AUDIO_ATTACHMENT = 50160,
  VOICE_MESSAGES_MUST_HAVE_SUPPORTING_METADATA = 50161,
  VOICE_MESSAGES_CANNOT_BE_EDITED = 50162,
  CANNOT_DELETE_GUILD_SUBSCRIPTION_INTEGRATION = 50163,
  YOU_CANNOT_SEND_VOICE_MESSAGES_IN_THIS_CHANNEL = 50173,
  USER_MUST_BE_VERIFIED = 50178,
  YOU_DO_NOT_HAVE_PERMISSION_TO_SEND_THIS_STICKER = 50600,

  // Rate limiting
  RATE_LIMITED = 429,
}

/**
 * Discord API error handler utility
 */
export class DiscordErrorHandler {
  /**
   * Maps Discord API errors to appropriate Takaro errors
   */
  static mapDiscordError(error: any): errors.TakaroError {
    // Handle DiscordAPIError specifically
    if (error instanceof DiscordAPIError || (error.code && typeof error.code === 'number')) {
      const code = error.code;
      const message = error.message || 'Discord API error';

      log.debug('Mapping Discord API error', { code, message, status: error.status });

      switch (code) {
        // Not found errors
        case DiscordErrorCodes.UNKNOWN_CHANNEL:
          return new errors.NotFoundError('Discord channel not found');
        case DiscordErrorCodes.UNKNOWN_GUILD:
          return new errors.NotFoundError('Discord guild not found');
        case DiscordErrorCodes.UNKNOWN_ROLE:
          return new errors.NotFoundError('Discord role not found');
        case DiscordErrorCodes.UNKNOWN_USER:
          return new errors.NotFoundError('Discord user not found');
        case DiscordErrorCodes.UNKNOWN_MESSAGE:
          return new errors.NotFoundError('Discord message not found');
        case DiscordErrorCodes.UNKNOWN_MEMBER:
          return new errors.NotFoundError('Discord member not found');

        // Permission errors
        case DiscordErrorCodes.MISSING_ACCESS:
          return new errors.ForbiddenError();
        case DiscordErrorCodes.MISSING_PERMISSIONS:
          return new errors.ForbiddenError();
        case DiscordErrorCodes.CANNOT_SEND_MESSAGES_TO_USER:
          return new errors.ForbiddenError();
        case DiscordErrorCodes.CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL:
          return new errors.BadRequestError('Cannot send messages in voice channel');
        case DiscordErrorCodes.CHANNEL_VERIFICATION_LEVEL_TOO_HIGH:
          return new errors.ForbiddenError();

        // Authentication errors
        case DiscordErrorCodes.INVALID_AUTHENTICATION_TOKEN:
          return new errors.UnauthorizedError();
        case DiscordErrorCodes.INVALID_OAUTH2_ACCESS_TOKEN:
          return new errors.UnauthorizedError();

        // Bad request errors
        case DiscordErrorCodes.CANNOT_SEND_EMPTY_MESSAGE:
          return new errors.BadRequestError('Cannot send empty message');
        case DiscordErrorCodes.INVALID_FORM_BODY:
          return new errors.BadRequestError('Invalid request body format');
        case DiscordErrorCodes.MESSAGE_TOO_OLD_TO_BULK_DELETE:
          return new errors.BadRequestError('Message too old to bulk delete');
        case DiscordErrorCodes.TOO_FEW_OR_TOO_MANY_MESSAGES_TO_DELETE:
          return new errors.BadRequestError('Invalid number of messages to delete');
        case DiscordErrorCodes.FILE_UPLOADED_EXCEEDS_MAXIMUM_SIZE:
          return new errors.BadRequestError('File size exceeds Discord limit');
        case DiscordErrorCodes.INVALID_FILE_UPLOADED:
          return new errors.BadRequestError('Invalid file format');
        case DiscordErrorCodes.REQUEST_BODY_CONTAINS_INVALID_JSON:
          return new errors.BadRequestError('Invalid JSON in request body');

        // Rate limiting
        case DiscordErrorCodes.RATE_LIMITED:
          return new errors.TooManyRequestsError('Discord API rate limit exceeded');

        // Conflict errors
        case DiscordErrorCodes.INVITE_CODE_INVALID_OR_TAKEN:
          return new errors.ConflictError('Invite code invalid or already taken');

        // Default cases for unknown errors
        default:
          log.warn('Unmapped Discord API error', { code, message, status: error.status });

          // Try to map by HTTP status if available
          if (error.status) {
            switch (error.status) {
              case 400:
                return new errors.BadRequestError(`Discord API error: ${message}`);
              case 401:
                return new errors.UnauthorizedError();
              case 403:
                return new errors.ForbiddenError();
              case 404:
                return new errors.NotFoundError(`Discord resource not found: ${message}`);
              case 409:
                return new errors.ConflictError(`Discord API conflict: ${message}`);
              case 429:
                return new errors.TooManyRequestsError('Discord API rate limit exceeded');
              case 500:
              case 502:
              case 503:
              case 504:
                return new errors.InternalServerError();
              default:
                return new errors.InternalServerError();
            }
          }

          return new errors.InternalServerError();
      }
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      log.error('Discord API network error', { code: error.code, message: error.message });
      return new errors.InternalServerError();
    }

    // Handle other error types
    if (error instanceof errors.TakaroError) {
      return error;
    }

    // Default fallback
    log.error('Unhandled Discord error', { error: error.message, stack: error.stack });
    return new errors.InternalServerError();
  }

  /**
   * Determines if an error is retryable
   */
  static isRetryableError(error: any): boolean {
    if (error instanceof DiscordAPIError || (error.code && typeof error.code === 'number')) {
      const code = error.code;

      // Rate limiting is retryable
      if (code === DiscordErrorCodes.RATE_LIMITED) {
        return true;
      }

      // These specific errors are retryable
      const retryableCodes = [
        DiscordErrorCodes.GENERAL_ERROR, // Sometimes transient
      ];

      if (retryableCodes.includes(code)) {
        return true;
      }
    }

    // Server errors are retryable (check status separately)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // Network errors are retryable
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return true;
    }

    return false;
  }

  /**
   * Gets retry delay from rate limit error
   */
  static getRetryDelay(error: any): number {
    if (
      (error instanceof DiscordAPIError || (error.code && typeof error.code === 'number')) &&
      error.code === DiscordErrorCodes.RATE_LIMITED
    ) {
      // Discord provides retry-after header in seconds
      const rawError = error.rawError as any;
      const retryAfter = rawError?.retry_after;
      if (retryAfter && typeof retryAfter === 'number') {
        return retryAfter * 1000; // Convert to milliseconds
      }
    }

    // Default exponential backoff delays (in milliseconds)
    return 1000;
  }

  /**
   * Logs Discord API error with appropriate level and context
   */
  static logError(error: any, context: Record<string, any> = {}): void {
    const logContext = {
      ...context,
      errorCode: error.code,
      errorMessage: error.message,
      errorStatus: error.status,
    };

    if (error instanceof DiscordAPIError || (error.code && typeof error.code === 'number')) {
      const code = error.code;

      // Rate limiting is expected, log as warning
      if (code === DiscordErrorCodes.RATE_LIMITED) {
        log.warn('Discord API rate limited', logContext);
        return;
      }

      // Permission errors are often expected, log as warning
      if (code === DiscordErrorCodes.MISSING_PERMISSIONS || code === DiscordErrorCodes.MISSING_ACCESS) {
        log.warn('Discord API permission error', logContext);
        return;
      }

      // Not found errors are often expected, log as info
      if (
        [
          DiscordErrorCodes.UNKNOWN_CHANNEL,
          DiscordErrorCodes.UNKNOWN_GUILD,
          DiscordErrorCodes.UNKNOWN_ROLE,
          DiscordErrorCodes.UNKNOWN_USER,
          DiscordErrorCodes.UNKNOWN_MESSAGE,
          DiscordErrorCodes.UNKNOWN_MEMBER,
        ].includes(code)
      ) {
        log.info('Discord API resource not found', logContext);
        return;
      }

      // Client errors (4xx) are warnings
      if (error.status >= 400 && error.status < 500) {
        log.warn('Discord API client error', logContext);
        return;
      }

      // Server errors (5xx) are errors
      if (error.status >= 500) {
        log.error('Discord API server error', logContext);
        return;
      }
    }

    // Network errors are errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      log.error('Discord API network error', logContext);
      return;
    }

    // Default to error level
    log.error('Discord API error', logContext);
  }
}
