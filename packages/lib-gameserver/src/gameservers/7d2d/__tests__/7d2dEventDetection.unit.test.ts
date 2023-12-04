/* eslint-disable quotes */
import { expect, sandbox } from '@takaro/test';
import {
  EventChatMessage,
  EventEntityKilled,
  EventPlayerConnected,
  EventPlayerDeath,
  GameEvents,
  IGamePlayer,
} from '@takaro/modules';
import { SdtdConnectionInfo } from '../connectionInfo.js';
import { SevenDaysToDieEmitter } from '../emitter.js';
import { SevenDaysToDie } from '../index.js';

const mockConnectionInfo = async (overrides?: Partial<SdtdConnectionInfo>) =>
  new SdtdConnectionInfo().construct({
    adminToken: 'aaa',
    adminUser: 'aaa',
    useTls: false,
    host: 'localhost',
    ...overrides,
  });

const mockGamePlayer = await new IGamePlayer().construct({
  name: 'Catalysm',
  ping: undefined,
  gameId: '0002b5d970954287afdcb5dc35af0424',
  steamId: '76561198028175941',
});

describe('7d2d event detection', () => {
  let emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');

  beforeEach(() => {
    sandbox.restore();
    emitStub = sandbox.stub(SevenDaysToDieEmitter.prototype, 'emit');
    sandbox.stub(SevenDaysToDie.prototype, 'steamIdOrXboxToGameId').resolves(mockGamePlayer);
  });

  it('[PlayerConnected]: Can detect simple player connected', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());
    await emitter.parseMessage({
      msg: `PlayerSpawnedInWorld (reason: JoinMultiplayer, position: 1873, 66, 347): EntityID=171, PltfmId='Steam_76561198028175941', CrossId='EOS_0002b5d970954287afdcb5dc35af0424', OwnerID='Steam_76561198028175941', PlayerName='Catalysm'`,
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_CONNECTED);
    expect((emitStub.getCalls()[0].args[1] as EventPlayerConnected).player).to.deep.equal({
      name: 'Catalysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect simple player connected when player connects for the first time', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());
    await emitter.parseMessage({
      msg: `PlayerSpawnedInWorld (reason: EnterMultiplayer, position: 1080, 61, 1089): EntityID=3812, PltfmId='Steam_76561198028175941', CrossId='EOS_0002b5d970954287afdcb5dc35af0424', OwnerID='Steam_76561198028175941', PlayerName='Catalysm', ClientNumber='6'`,
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_CONNECTED);
    expect((emitStub.getCalls()[0].args[1] as EventPlayerConnected).player).to.deep.equal({
      name: 'Catalysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect Xbox player connected', async () => {
    await new SevenDaysToDieEmitter(await mockConnectionInfo()).parseMessage({
      msg: `PlayerSpawnedInWorld (reason: JoinMultiplayer, position: 1873, 66, 347): EntityID=171, PltfmId='XBL_123456abcdef', CrossId='EOS_0002b5d970954287afdcb5dc35af0424', OwnerID='Steam_76561198028175941', PlayerName='Catalysm'`,
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_CONNECTED);
    expect((emitStub.getCalls()[0].args[1] as EventPlayerConnected).player).to.deep.equal({
      name: 'Catalysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: undefined,
      xboxLiveId: '123456abcdef',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerConnected]: Can detect player connected with space', async () => {
    await new SevenDaysToDieEmitter(await mockConnectionInfo()).parseMessage({
      msg: `PlayerSpawnedInWorld (reason: JoinMultiplayer, position: 1873, 66, 347): EntityID=171, PltfmId='Steam_76561198028175941', CrossId='EOS_0002b5d970954287afdcb5dc35af0424', OwnerID='Steam_76561198028175941', PlayerName='Cata lysm'`,
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_CONNECTED);
    expect((emitStub.getCalls()[0].args[1] as EventPlayerConnected).player).to.deep.equal({
      name: 'Cata lysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: '76561198028175941',
      epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      xboxLiveId: undefined,
      ip: undefined,
      platformId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[PlayerDisconnected]: Can detect simple player disconnected', async () => {
    await new SevenDaysToDieEmitter(await mockConnectionInfo()).parseMessage({
      // eslint-disable-next-line quotes
      msg: `Player disconnected: EntityID=171, PltfmId='Steam_76561198028175941', CrossId='EOS_0002b5d970954287afdcb5dc35af0424', OwnerID='Steam_76561198028175941', PlayerName='Catalysm'`,
    });
    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_DISCONNECTED);
    expect((emitStub.getCalls()[0].args[1] as EventPlayerConnected).player).to.deep.equal({
      name: 'Catalysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: '76561198028175941',
      xboxLiveId: undefined,
      ip: undefined,
      platformId: undefined,
      epicOnlineServicesId: undefined,
    });
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
  });

  it('[ChatMessage] Can detect chat message', async () => {
    // Chat handled by mod 'CSMM Patrons': Chat (from 'Steam_76561198028175941', entity id '549', to 'Global'): 'Catalysm': /ping
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());

    await emitter.parseMessage({
      // eslint-disable-next-line quotes
      msg: `Chat handled by mod 'CSMM Patrons': Chat (from 'Steam_76561198028175941', entity id '549', to 'Global'): 'Catalysm': fsafsafasf`,
    });

    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.CHAT_MESSAGE);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);

    expect((emitStub.getCalls()[0].args[1] as EventChatMessage).player).to.deep.equal({
      name: 'Catalysm',
      ping: undefined,
      gameId: '0002b5d970954287afdcb5dc35af0424',
      steamId: '76561198028175941',
      xboxLiveId: undefined,
      ip: undefined,
      platformId: undefined,
      epicOnlineServicesId: undefined,
    });
  });

  it('[ChatMessage] Can deduplicate messages when a mod handles it', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());

    await emitter.parseMessage({
      // eslint-disable-next-line quotes
      msg: `Chat (from 'Steam_76561198028175941', entity id '546', to 'Global'): 'Catalysm':&ping`,
    });

    await emitter.parseMessage({
      // eslint-disable-next-line quotes
      msg: `Chat handled by mod '1CSMM_Patrons': Chat (from 'Steam_76561198028175941', entity id '546', to 'Global'): 'Catalysm': &ping`,
    });

    expect(emitStub).to.have.been.calledThrice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.CHAT_MESSAGE);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
    expect(emitStub.getCalls()[2].args[0]).to.equal(GameEvents.LOG_LINE);
  });
  it('[PlayerDeath] Can detect player death', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());

    await emitter.parseMessage({
      msg: `GMSG: Player '${mockGamePlayer.name}' died`,
    });
    await emitter.parseMessage({
      msg: `[CSMM_Patrons]playerDied: ${mockGamePlayer.name} (Steam_${mockGamePlayer.steamId}) died @ 702 34 -2938`,
    });

    expect(emitStub).to.have.been.calledThrice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.PLAYER_DEATH);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
    expect(emitStub.getCalls()[2].args[0]).to.equal(GameEvents.LOG_LINE);

    expect((emitStub.getCalls()[0].args[1] as EventPlayerDeath).player.name).to.equal(mockGamePlayer.name);

    expect((emitStub.getCalls()[0].args[1] as EventPlayerDeath).position).to.deep.equal({
      x: NaN,
      y: NaN,
      z: NaN,
    });
  });

  it('[PlayerDeath] Can detect CPM player death', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo({ useCPM: true }));

    await emitter.parseMessage({
      msg: `GMSG: Player '${mockGamePlayer.name}' died`,
    });
    await emitter.parseMessage({
      msg: `[CSMM_Patrons]playerDied: ${mockGamePlayer.name} (Steam_${mockGamePlayer.steamId}) died @ 702 34 -2938`,
    });

    expect(emitStub).to.have.been.calledThrice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.LOG_LINE);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.PLAYER_DEATH);
    expect(emitStub.getCalls()[2].args[0]).to.equal(GameEvents.LOG_LINE);

    expect((emitStub.getCalls()[1].args[1] as EventPlayerDeath).player.name).to.equal(mockGamePlayer.name);

    expect((emitStub.getCalls()[1].args[1] as EventPlayerDeath).position).to.deep.equal({
      x: 702,
      y: 34,
      z: -2938,
    });
  });

  it('[EntityKilled] Can detect entity killed', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo());

    await emitter.parseMessage({
      msg: `Entity zombieNurse 613814 killed by ${mockGamePlayer.name} 54854`,
    });
    await emitter.parseMessage({
      msg: `[CSMM_Patrons]entityKilled: ${mockGamePlayer.name} (Steam_${mockGamePlayer.steamId}) killed zombie zombieNurse with S.H.I.E.L.D. Auto Shotgun`,
    });

    expect(emitStub).to.have.been.calledThrice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.ENTITY_KILLED);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.LOG_LINE);
    expect(emitStub.getCalls()[2].args[0]).to.equal(GameEvents.LOG_LINE);

    expect((emitStub.getCalls()[0].args[1] as EventEntityKilled).entity).to.equal('zombieNurse');
    expect((emitStub.getCalls()[0].args[1] as EventEntityKilled).player.name).to.equal(mockGamePlayer.name);
    expect((emitStub.getCalls()[0].args[1] as EventEntityKilled).weapon).to.equal(undefined);
  });

  it('[EntityKilled] Can detect CPM entity killed', async () => {
    const emitter = new SevenDaysToDieEmitter(await mockConnectionInfo({ useCPM: true }));

    await emitter.parseMessage({
      msg: `Entity zombieNurse 613814 killed by ${mockGamePlayer.name} 54854`,
    });
    await emitter.parseMessage({
      msg: `[CSMM_Patrons]entityKilled: ${mockGamePlayer.name} (Steam_${mockGamePlayer.steamId}) killed zombie zombieNurse with S.H.I.E.L.D. Auto Shotgun`,
    });

    expect(emitStub).to.have.been.calledThrice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(GameEvents.LOG_LINE);
    expect(emitStub.getCalls()[1].args[0]).to.equal(GameEvents.ENTITY_KILLED);
    expect(emitStub.getCalls()[2].args[0]).to.equal(GameEvents.LOG_LINE);

    expect((emitStub.getCalls()[1].args[1] as EventEntityKilled).entity).to.equal('zombieNurse');
    expect((emitStub.getCalls()[1].args[1] as EventEntityKilled).player.name).to.equal(mockGamePlayer.name);
    expect((emitStub.getCalls()[1].args[1] as EventEntityKilled).weapon).to.equal('S.H.I.E.L.D. Auto Shotgun');
  });
});
