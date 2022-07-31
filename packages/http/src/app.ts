import express, { Application } from 'express';
import { Server } from 'http';
import { healthHandler } from './routes/health';

interface IAppOptions {
  port: number;
}

export class HTTP {
  private app: Application;
  private httpServer: Server;
  /**
   *
   */
  constructor(private readonly options: IAppOptions) {
    this.app = express();
    this.app.use('/health', healthHandler);
  }

  get expressInstance() {
    return this.app;
  }

  async start() {
    this.httpServer = this.app.listen(this.options.port);
  }

  async stop() {
    this.httpServer.close();
  }
}
