import 'reflect-metadata';
import express, { Application } from 'express';
import { logger } from '@takaro/logger';
import { Server } from 'http';
import {
  RoutingControllersOptions,
  useExpressServer,
} from 'routing-controllers';
import { MetaController } from './controllers/meta';
import { LoggingMiddleware } from './middleware/logger';
import { ErrorHandler } from './middleware/errorHandler';
import bodyParser from 'body-parser';

interface IHTTPOptions {
  port?: number;
}

export class HTTP {
  private app: Application;
  private httpServer: Server | null = null;
  private logger;

  constructor(
    options: RoutingControllersOptions = {},
    private httpOptions: IHTTPOptions = {}
  ) {
    this.logger = logger('http');
    this.app = express();
    this.app.use(bodyParser.json());
    if (options.controllers) {
      useExpressServer(this.app, {
        ...options,
        defaultErrorHandler: false,
        validation: { forbidNonWhitelisted: true, whitelist: true },
        // eslint-disable-next-line @typescript-eslint/ban-types
        controllers: [MetaController, ...(options.controllers as Function[])],
      });
    } else {
      useExpressServer(this.app, {
        ...options,
        defaultErrorHandler: false,
        controllers: [MetaController],
        middlewares: [LoggingMiddleware, ErrorHandler],
      });
    }
  }

  get expressInstance() {
    return this.app;
  }

  async start() {
    this.httpServer = this.app.listen(this.httpOptions.port, () => {
      this.logger.info(
        `HTTP server listening on port ${this.httpOptions.port}`
      );
    });
  }

  async stop() {
    if (this.httpServer) {
      this.httpServer.close();
      this.logger.info('HTTP server stopped');
    }
  }
}
