import 'reflect-metadata';
import express, { Application } from 'express';
import { logger, errors } from '@takaro/util';
import { Server, createServer } from 'node:http';
import { RoutingControllersOptions, useExpressServer } from 'routing-controllers';
import { Meta } from './controllers/meta.js';
import { LoggingMiddleware } from './middleware/logger.js';
import { ErrorHandler } from './middleware/errorHandler.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { metricsMiddleware } from './main.js';
import { paginationMiddleware } from './middleware/paginationMiddleware.js';

interface IHTTPOptions {
  port?: number;
  allowedOrigins?: string[];
}

export class HTTP {
  private app: Application;
  private httpServer: Server;
  private logger;

  constructor(
    options: RoutingControllersOptions = {},
    private httpOptions: IHTTPOptions = {},
  ) {
    this.logger = logger('http');
    this.app = express();
    this.httpServer = createServer(this.app);
    this.app.use(
      bodyParser.json({
        limit: '1mb',
        verify: (req, res, buf) => {
          (req as any).rawBody = buf.toString();
        },
      }),
    );
    this.app.use(LoggingMiddleware);
    this.app.use(metricsMiddleware);
    this.app.use(paginationMiddleware);
    this.app.set('x-powered-by', false);
    this.app.use(
      cors({
        credentials: true,
        exposedHeaders: ['X-Trace-Id'],
        origin: (origin: string | undefined, callback: CallableFunction) => {
          if (!origin) return callback(null, true);
          const allowedOrigins = this.httpOptions.allowedOrigins ?? [];
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            this.logger.warn(`Origin ${origin} not allowed by CORS`);
            callback(new errors.BadRequestError('Not allowed by CORS'));
          }
        },
      }),
    );
    this.app.use(cookieParser());

    if (options.controllers) {
      useExpressServer(this.app, {
        ...options,
        defaultErrorHandler: false,
        validation: { whitelist: true, forbidNonWhitelisted: true },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        controllers: [Meta, ...(options.controllers as Function[])],
      });
    } else {
      useExpressServer(this.app, {
        ...options,
        defaultErrorHandler: false,
        controllers: [Meta],
        validation: { whitelist: true, forbidNonWhitelisted: true },
      });
    }

    this.app.use(ErrorHandler);
  }

  get expressInstance() {
    return this.app;
  }

  get server(): Server {
    return this.httpServer;
  }

  async start() {
    this.httpServer = this.httpServer.listen(this.httpOptions.port, () => {
      this.logger.info(`HTTP server listening on port ${this.httpOptions.port}`);
    });
  }

  async stop() {
    if (this.httpServer) {
      this.httpServer.close();
      this.logger.info('HTTP server stopped');
    }
  }
}
