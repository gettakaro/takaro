import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram } from 'prom-client';

const counter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made',
  labelNames: ['path', 'method', 'status'],
});

const histogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['path', 'method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export async function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const rawPath = req.path;
  const method = req.method;
  // Filter out anything that looks like a UUID from path
  const path = rawPath.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '/:id');

  const start = Date.now();

  try {
    await next();
  } catch (error) {
    throw error;
  } finally {
    counter.inc({
      path,
      method,
      status: res.statusCode.toString(),
    });
    histogram.observe(
      {
        path,
        method,
        status: res.statusCode.toString(),
      },
      (Date.now() - start) / 1000,
    );
  }
}
