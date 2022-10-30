import { expect, sandbox } from '@takaro/test';
import { SdtdConnectionInfo } from '../';
import { GameEvents } from '../../../main';
import { SevenDaysToDieEmitter } from '../emitter';

const mockSdtdConnectionInfo: SdtdConnectionInfo = {
  adminToken: 'aaa',
  adminUser: 'aaa',
  useTls: false,
  host: 'localhost',
};

describe('7d2d event detection', () => {
  let emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');

  beforeEach(() => {
    sandbox.restore();
    emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');
  });

  it('[PlayerConnected]: Can detect simple player connected', () => {
    new SevenDaysToDieEmitter(mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Catalysm, pltfmid=Steam_76561198028175941, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect Xbox player connected', () => {
    new SevenDaysToDieEmitter(mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Catalysm, pltfmid=XBL_123456abcdef, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: undefined,
      xboxLiveId: '123456abcdef',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect player connected with space', () => {
    new SevenDaysToDieEmitter(mockSdtdConnectionInfo).parseMessage({
      msg: '2022-01-21T20:43:26 60120.462 INF Player connected, entityid=549, name=Cata lysm, pltfmid=Steam_76561198028175941, crossid=EOS_0002b5d970954287afdcb5dc35af0424, steamOwner=Steam_76561198028175941, ip=127.0.0.1',
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );
    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal({
      name: 'Cata lysm',
      gameId: '549',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerDisconnected]: Can detect simple player disconnected', () => {
    new SevenDaysToDieEmitter(mockSdtdConnectionInfo).parseMessage({
      // eslint-disable-next-line quotes
      msg: "Player disconnected: EntityID=549, PltfmId='Steam_76561198028175941', OwnerID='76561198028175941', PlayerName='Catalysm'",
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_DISCONNECTED
    );
    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal({
      name: 'Catalysm',
      gameId: '549',
      steamId: '76561198028175941',
      xboxLiveId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });
});
