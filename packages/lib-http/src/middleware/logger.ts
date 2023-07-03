import { NextFunction, Request, Response } from 'express';
import { logger, ctx } from '@takaro/util';

const SUPPRESS_BODY_KEYWORDS = ['password', 'newPassword'];

const log = logger('http');

/**
 * This middleware is called very early in the request lifecycle, so it's
 * we leverage this fact to inject the context tracking at this stage
 */
export const LoggingMiddleware = ctx.wrap('HTTP', loggingMiddleware);

async function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestStartMs = Date.now();

  const hideData = SUPPRESS_BODY_KEYWORDS.some((keyword) => (JSON.stringify(req.body) || '').includes(keyword));

  log.debug(`⬇️ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    body: hideData ? { suppressed_output: true } : req.body,
  });
  // Log on API Call Finish to add responseTime
  res.once('finish', () => {
    const responseTime = Date.now() - requestStartMs;

    log.info(`⬆️ ${req.method} ${req.originalUrl}`, {
      responseTime,
      requestMethod: req.method,
      requestUrl: req.originalUrl,
      requestSize: req.headers['content-length'],
      status: res.statusCode,
      responseSize: res.getHeader('Content-Length'),
      userAgent: req.get('User-Agent'),
      remoteIp: req.ip,
      serverIp: '127.0.0.1',
      referer: req.get('Referer'),
      cacheLookup: false,
      cacheHit: false,
      cacheValidatedWithOriginServer: false,
      protocol: req.protocol,
    });
  });

  next();
}
