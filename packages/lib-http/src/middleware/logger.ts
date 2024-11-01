import { NextFunction, Request, Response } from 'express';
import { logger, ctx } from '@takaro/util';
import { context, trace } from '@opentelemetry/api';

const SUPPRESS_BODY_KEYWORDS = ['password', 'newPassword'];
const HIDDEN_ROUTES = ['/metrics', '/health', '/healthz', '/ready', '/readyz', '/queues/api/queues'];
const log = logger('http');

/**
 * This middleware is called very early in the request lifecycle, so it's
 * we leverage this fact to inject the context tracking at this stage
 */
export const LoggingMiddleware = ctx.wrap('HTTP', loggingMiddleware) as typeof loggingMiddleware;

async function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  if (HIDDEN_ROUTES.some((route) => req.originalUrl.startsWith(route))) {
    return next();
  }

  const requestStartMs = Date.now();

  const hideData = SUPPRESS_BODY_KEYWORDS.some((keyword) => (JSON.stringify(req.body) || '').includes(keyword));

  log.debug(`⬇️ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    body: hideData ? { suppressed_output: true } : req.body,
  });

  const span = trace.getSpan(context.active());

  if (span) {
    // get the trace ID from the span and set it in the headers
    const traceId = span.spanContext().traceId;
    res.header('X-Trace-Id', traceId);
  }

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
