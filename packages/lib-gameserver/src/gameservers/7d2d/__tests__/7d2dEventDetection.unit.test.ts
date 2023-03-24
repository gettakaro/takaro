import { expect, sandbox } from '@takaro/test';
import { SdtdConnectionInfo } from '../index.js';
import {
  EventChatMessage,
  EventPlayerConnected,
  GameEvents,
} from '../../../main.js';
import { SevenDaysToDieEmitter } from '../emitter.js';

const mockSdtdConnectionInfo = new SdtdConnectionInfo().construct({
  adminToken: 'aaa',
  adminUser: 'aaa',
  useTls: false,
  host: 'localhost',
});

describe('7d2d event detection', () => {
  let emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');

  beforeEach(() => {
    sandbox.restore();
    emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');
  });

  it('[PlayerConnected]: Can detect simple player connected', async () => {
    await new SevenDaysToDieEmitter(await mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Catalysm, pltfmid=Steam_76561198028175941, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(
      (emitStub.getCalls()[0].args[1] as EventPlayerConnected).player
    ).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
      device: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect Xbox player connected', async () => {
    await new SevenDaysToDieEmitter(await mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Catalysm, pltfmid=XBL_123456abcdef, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(
      (emitStub.getCalls()[0].args[1] as EventPlayerConnected).player
    ).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: undefined,
      xboxLiveId: '123456abcdef',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      device: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect player connected with space', async () => {
    await new SevenDaysToDieEmitter(await mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Cata lysm, pltfmid=Steam_76561198028175941, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(
      (emitStub.getCalls()[0].args[1] as EventPlayerConnected).player
    ).to.deep.equal({
      name: 'Cata lysm',
      gameId: '549',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
      device: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerDisconnected]: Can detect simple player disconnected', async () => {
    await new SevenDaysToDieEmitter(await mockSdtdConnectionInfo).parseMessage({
      // eslint-disable-next-line quotes
      msg: "Player disconnected: EntityID=549, PltfmId='Steam_76561198028175941', OwnerID='76561198028175941', PlayerName='Catalysm'",
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_DISCONNECTED
    );
    expect(
      (emitStub.getCalls()[0].args[1] as EventPlayerConnected).player
    ).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: '76561198028175941',
      xboxLiveId: undefined,
      device: undefined,
      ip: undefined,
      platformId: undefined,
      epicOnlineServicesId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[ChatMessage] Can detect chat message', async () => {
    // Chat handled by mod 'CSMM Patrons': Chat (from 'Steam_76561198028175941', entity id '549', to 'Global'): 'Catalysm': /ping
    await new SevenDaysToDieEmitter(await mockSdtdConnectionInfo).parseMessage({
      // eslint-disable-next-line quotes
      msg: `Chat handled by mod 'CSMM Patrons': Chat (from 'Steam_76561198028175941', entity id '549', to 'Global'): 'Catalysm': fsafsafasf`,
    });

    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.CHAT_MESSAGE);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);

    expect(
      (emitStub.getCalls()[0].args[1] as EventChatMessage).player
    ).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: '76561198028175941',
      xboxLiveId: undefined,
      device: undefined,
      ip: undefined,
      platformId: undefined,
      epicOnlineServicesId: undefined,
    });
  });
});
