import { describe, it } from 'node:test';
import { expect } from '@takaro/test';
import { errors } from '@takaro/util';
import { DiscordErrorHandler, DiscordErrorCodes } from '../DiscordErrorHandler.js';

describe('DiscordErrorHandler', () => {
  describe('mapDiscordError', () => {
    it('should map unknown channel error to NotFoundError', () => {
      const discordError = {
        code: DiscordErrorCodes.UNKNOWN_CHANNEL,
        message: 'Unknown Channel',
        status: 404,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.NotFoundError);
      expect(result.message).to.equal('Discord channel not found');
    });

    it('should map unknown guild error to NotFoundError', () => {
      const discordError = {
        code: DiscordErrorCodes.UNKNOWN_GUILD,
        message: 'Unknown Guild',
        status: 404,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.NotFoundError);
      expect(result.message).to.equal('Discord guild not found');
    });

    it('should map missing permissions error to ForbiddenError', () => {
      const discordError = {
        code: DiscordErrorCodes.MISSING_PERMISSIONS,
        message: 'Missing Permissions',
        status: 403,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.ForbiddenError);
    });

    it('should map rate limit error to TooManyRequestsError', () => {
      const discordError = {
        code: DiscordErrorCodes.RATE_LIMITED,
        message: 'Rate Limited',
        status: 429,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.TooManyRequestsError);
      expect(result.message).to.equal('Discord API rate limit exceeded');
    });

    it('should map invalid form body error to BadRequestError', () => {
      const discordError = {
        code: DiscordErrorCodes.INVALID_FORM_BODY,
        message: 'Invalid Form Body',
        status: 400,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.BadRequestError);
      expect(result.message).to.equal('Invalid request body format');
    });

    it('should map unknown error code by HTTP status', () => {
      const discordError = {
        code: 99999, // Unknown code
        message: 'Some error',
        status: 400,
      };

      const result = DiscordErrorHandler.mapDiscordError(discordError);
      expect(result).to.be.instanceOf(errors.BadRequestError);
      expect(result.message).to.equal('Discord API error: Some error');
    });

    it('should map network errors to InternalServerError', () => {
      const networkError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      const result = DiscordErrorHandler.mapDiscordError(networkError);
      expect(result).to.be.instanceOf(errors.InternalServerError);
    });

    it('should pass through existing TakaroError', () => {
      const existingError = new errors.BadRequestError('Custom error');
      const result = DiscordErrorHandler.mapDiscordError(existingError);
      expect(result).to.equal(existingError);
    });

    it('should default to InternalServerError for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const result = DiscordErrorHandler.mapDiscordError(unknownError);
      expect(result).to.be.instanceOf(errors.InternalServerError);
    });
  });

  describe('isRetryableError', () => {
    it('should identify rate limit errors as retryable', () => {
      const rateLimitError = {
        code: DiscordErrorCodes.RATE_LIMITED,
        status: 429,
      };

      const result = DiscordErrorHandler.isRetryableError(rateLimitError);
      expect(result).to.be.true;
    });

    it('should identify server errors as retryable', () => {
      const serverError = {
        code: 0,
        status: 500,
      };

      const result = DiscordErrorHandler.isRetryableError(serverError);
      expect(result).to.be.true;
    });

    it('should identify network errors as retryable', () => {
      const networkError = {
        code: 'ETIMEDOUT',
        message: 'Timeout',
      };

      const result = DiscordErrorHandler.isRetryableError(networkError);
      expect(result).to.be.true;
    });

    it('should identify client errors as non-retryable', () => {
      const clientError = {
        code: DiscordErrorCodes.MISSING_PERMISSIONS,
        status: 403,
      };

      const result = DiscordErrorHandler.isRetryableError(clientError);
      expect(result).to.be.false;
    });

    it('should identify not found errors as non-retryable', () => {
      const notFoundError = {
        code: DiscordErrorCodes.UNKNOWN_CHANNEL,
        status: 404,
      };

      const result = DiscordErrorHandler.isRetryableError(notFoundError);
      expect(result).to.be.false;
    });
  });

  describe('getRetryDelay', () => {
    it('should extract retry delay from rate limit error', () => {
      const rateLimitError = {
        code: DiscordErrorCodes.RATE_LIMITED,
        rawError: {
          retry_after: 5,
        },
      } as any;

      const result = DiscordErrorHandler.getRetryDelay(rateLimitError);
      expect(result).to.equal(5000); // Should convert seconds to milliseconds
    });

    it('should return default delay for non-rate-limit errors', () => {
      const otherError = {
        code: DiscordErrorCodes.UNKNOWN_CHANNEL,
        message: 'Unknown Channel',
      };

      const result = DiscordErrorHandler.getRetryDelay(otherError);
      expect(result).to.equal(1000); // Default delay
    });

    it('should return default delay when retry_after is missing', () => {
      const rateLimitError = {
        code: DiscordErrorCodes.RATE_LIMITED,
        rawError: {},
      } as any;

      const result = DiscordErrorHandler.getRetryDelay(rateLimitError);
      expect(result).to.equal(1000); // Default delay
    });
  });
});
