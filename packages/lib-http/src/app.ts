import 'reflect-metadata';
import { Application } from 'express';
import { logger } from '@takaro/logger';
import { Server } from 'http';
import { config } from './config';
import {
  createExpressServer,
  RoutingControllersOptions,
} from 'routing-controllers';
import { MetaController } from './controllers/meta';
import { LoggingMiddleware } from './middleware/logger';
import { ErrorHandler } from './middleware/errorHandler';

export class HTTP {
  private app: Application;
  private httpServer: Server | null = null;
  private logger;

  constructor(options: RoutingControllersOptions = {}) {
    this.logger = logger('http');
    config.validate();

    if (options.controllers) {
      this.app = createExpressServer({
        ...options,
        validation: { forbidNonWhitelisted: true, whitelist: true },
        // eslint-disable-next-line @typescript-eslint/ban-types
        controllers: [MetaController, ...(options.controllers as Function[])],
      });
    } else {
      this.app = createExpressServer({
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
    this.httpServer = this.app.listen(config.get('http.port'), () => {
      this.logger.info(
        `HTTP server listening on port ${config.get('http.port')}`
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
