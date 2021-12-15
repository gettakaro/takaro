import { database } from '@takaro/shared';

import { SevenDaysToDieGameConnector } from './7daystodie';
import { MockConnector } from './mockConnector.test';

export function getConnectorClass(server: database.GameServer) {
  switch (server.type) {
    case database.GameServerTypes.SDTD:
      return SevenDaysToDieGameConnector;
    case database.GameServerTypes.MOCK:
      return MockConnector;
    default:
      throw new Error(`Server type not implemented: ${server.type}`);
  }
}