import express, { Application } from 'express';
import { Server } from 'http';
import { config } from './config';
import { healthHandler } from './routes/health';

export class HTTP {
  private app: Application;
  private httpServer: Server;

  constructor() {
    config.validate();
    this.app = express();
    this.app.use('/health', healthHandler);
  }

  get expressInstance() {
    return this.app;
  }

  async start() {
    this.httpServer = this.app.listen(config.get('http.port'));
  }

  async stop() {
    this.httpServer.close();
  }
}
