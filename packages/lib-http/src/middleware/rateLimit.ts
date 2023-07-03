import { Request, Response, NextFunction } from 'express';
import { Redis } from '@takaro/db';
import { logger, errors, ctx } from '@takaro/util';
import { RateLimiterRes, RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';

export interface IRateLimitMiddlewareOptions {
  max: number;
  windowSeconds: number;
  keyPrefix?: string;
  useInMemory?: boolean;
}

export async function createRateLimitMiddleware(opts: IRateLimitMiddlewareOptions) {
  const log = logger('http:rateLimit');
  const redis = await Redis.getClient('http:rateLimit', {
    // Legacy mode is required for rate-limiter-flexible which isn't updated
    // to use the new v4 redis API.
    // See: https://github.com/animir/node-rate-limiter-flexible/wiki/Redis#usage
    legacyMode: true,
  });

  // We create a randomHash to use in Redis keys
  // This makes sure that each endpoint can get different rate limits without too much hassle
  const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let rateLimiter: RateLimiterMemory | RateLimiterRedis;

  if (opts.useInMemory) {
    rateLimiter = new RateLimiterMemory({
      points: opts.max,
      duration: opts.windowSeconds,
      keyPrefix: `http:rateLimit:${opts.keyPrefix ? opts.keyPrefix : randomHash}`,
    });
  } else {
    rateLimiter = new RateLimiterRedis({
      points: opts.max,
      duration: opts.windowSeconds,
      storeClient: redis,
      keyPrefix: `http:rateLimit:${opts.keyPrefix ? opts.keyPrefix : randomHash}`,
    });
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    const ctxData = ctx.data;
    let limitedKey = null;
    if (ctxData.user) {
      limitedKey = ctxData.user;
    } else {
      limitedKey = req.ip;
    }

    let rateLimiterRes: RateLimiterRes | null = null;

    try {
      console.log(`Consuming one for ${limitedKey}`);
      rateLimiterRes = await rateLimiter.consume(limitedKey);
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        rateLimiterRes = err;
        log.warn(`rate limited, try again in ${err.msBeforeNext}ms`);
      } else {
        throw err;
      }
    }

    if (rateLimiterRes) {
      res.set('X-RateLimit-Limit', opts.max.toString());
      res.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString());
      res.set('X-RateLimit-Reset', rateLimiterRes.msBeforeNext.toString());

      if (rateLimiterRes.remainingPoints === 0) {
        next(new errors.TooManyRequestsError());
      }
    }

    return next();
  };
}
