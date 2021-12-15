import { database, EVENTS } from '@takaro/shared';
import { expect, sandbox } from '@takaro/test';

import { IChatMessage } from './base';
import { MockConnector } from './mockConnector.test';

describe('gameConnector', function () {
  let connector: MockConnector;
  this.beforeEach(async () => {
    connector = new MockConnector('test');
    await connector.stop();
  });

  this.afterEach(async() => {
    await connector.stop();
  });

  it('Sends out appropriate messages', async function () {
    const mockData : IChatMessage = { 
      message: 'hello world!', 
      player: new database.Player(),
      type: EVENTS.CHAT_MESSAGE
    };

    const stub = sandbox.stub(connector['ingameCommandProducer'], 'add').resolves();
    
    await connector.parseMessage(mockData);

    expect(stub).to.have.been.calledWith(mockData);
  });

});