import { database } from '@takaro/shared';

import { Coordinator } from '.';
import { GameConnector } from '../gameConnector/base';
import { getConnectorClass } from '../gameConnector/getConnector';

export class SimpleCoordinator extends Coordinator {
  connectors: Array<GameConnector>;
  constructor() {
    super();
  }

  async start(): Promise<void> {
    const allServers = await database.GameServer.find();
    for (const server of allServers) {
      const connectorClass = getConnectorClass(server);
      const connector = new connectorClass(server.id);
      await connector.start();
      this.connectors.push(connector);
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.connectors.map(c => c.stop()));
  }
}