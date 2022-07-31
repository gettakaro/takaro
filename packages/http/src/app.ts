import express, { Application } from 'express';
import { logger } from '@takaro/logger';
import { Server } from 'http';
import { config } from './config';
import { healthHandler } from './routes/health';

export class HTTP {
  private app: Application;
  private httpServer: Server;
  private logger;

  constructor() {
    this.logger = logger('http');
    config.validate();
    this.app = express();
    this.app.use('/health', healthHandler);
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
    this.httpServer.close();
  }
}
