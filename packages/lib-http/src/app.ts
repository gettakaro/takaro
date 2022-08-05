import express, { Application } from 'express';
import { logger } from '@takaro/logger';
import { Server } from 'http';
import { config } from './config';
import { getHealth } from './routes/health';
import { Route } from './routes/Route';

export class HTTP {
  private app: Application;
  private httpServer: Server;
  private logger;

  constructor(routes: Route[] = []) {
    this.logger = logger('http');
    config.validate();
    this.app = express();

    getHealth.load(this.app);

    for (const route of routes) {
      route.load(this.app);
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
    this.httpServer.close();
  }
}
