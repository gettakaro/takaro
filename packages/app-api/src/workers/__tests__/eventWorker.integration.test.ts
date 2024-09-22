import { EventsAwaiter, IntegrationTest, SetupGameServerPlayers, expect, integrationConfig } from '@takaro/test';
import { GameEvents, IGamePlayer } from '@takaro/modules';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { v4 as uuid } from 'uuid';
import { PlayerService } from '../../service/PlayerService.js';
import { sleep } from '@takaro/util';

const group = 'Event worker';

const tests = [
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: false,
    name: 'Handles player joined event correctly',
    setup: async function () {
      return (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'my-server',
          type: 'MOCK',
          connectionInfo: JSON.stringify({
            host: integrationConfig.get('mockGameserver.host'),
          }),
        })
      ).data.data;
    },
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'brunkel',
        gameId: uuid(),
        steamId: '76561198021481871',
      });

      await playerService.resolveRef(MOCK_PLAYER, this.setupData.id);

      const players = await this.client.player.playerControllerSearch();

      const player = players.data.data.find((player) => player.steamId === MOCK_PLAYER.steamId);

      expect(player).to.not.be.null;
      expect(player?.steamId).to.eq(MOCK_PLAYER.steamId);

      return players;
    },
  }),
  new IntegrationTest<GameServerOutputDTO[]>({
    group,
    snapshot: false,
    name: 'Handles player syncing correctly when same gameId exists for different servers',
    setup: async function () {
      const server1 = await this.client.gameserver.gameServerControllerCreate({
        name: 'server1',
        type: 'MOCK',
        connectionInfo: JSON.stringify({
          host: integrationConfig.get('mockGameserver.host'),
        }),
      });

      const server2 = await this.client.gameserver.gameServerControllerCreate({
        name: 'server2',
        type: 'MOCK',
        connectionInfo: JSON.stringify({
          host: integrationConfig.get('mockGameserver.host'),
        }),
      });

      return [server1.data.data, server2.data.data];
    },
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const pogs = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameId: ['1'],
          gameServerId: [this.setupData[0].id],
        },
      });

      const pog = pogs.data.data[0];

      if (!pog) throw new Error('No player on game server found');

      const playerRes = await this.client.player.playerControllerGetOne(pog.playerId);

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'jefke',
        gameId: pog.gameId,
        steamId: playerRes.data.data.steamId,
      });

      await playerService.resolveRef(MOCK_PLAYER, this.setupData[0].id);
      await playerService.resolveRef(MOCK_PLAYER, this.setupData[1].id);

      const playersResAfter = await this.client.player.playerControllerSearch({
        filters: {
          steamId: [MOCK_PLAYER.steamId as string],
        },
        extend: ['playerOnGameServers'],
      });

      expect(playersResAfter.data.data[0].playerOnGameServers).to.have.lengthOf(2);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Correctly increases playtime on player disconnected event',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const originalPogs = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(originalPogs.data.data).to.have.lengthOf(5);
      // Should all have 0 playtime
      originalPogs.data.data.forEach((pog) => {
        expect(pog.playtimeSeconds).to.eq(0, 'Playtime should be 0 at start of test');
      });

      const connectedEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.PLAYER_CONNECTED,
        5,
      );
      // First, make sure all players are online
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: 'connectAll',
      });

      expect(await connectedEvents).to.have.lengthOf(5);

      // Wait a second, to ensure there's a noticeable difference in playtime
      await sleep(1000);

      // Disconnect all the players, and wait for the events
      // This will trigger the logic of increasing playtime
      const disconnectedEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.PLAYER_DISCONNECTED,
        5,
      );
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: 'disconnectAll',
      });

      expect(await disconnectedEvents).to.have.lengthOf(5);
      // Playtime calc happens AFTER the event is handled, so we need to wait a bit
      await sleep(500);

      const updatedPogs = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(updatedPogs.data.data).to.have.lengthOf(5);
      // Should all have a playtime greater than 0
      // Due to the async nature of tests, we don't have tight control over the exact playtime
      // So just a simple check to see if it's greater than 0 is enough
      updatedPogs.data.data.forEach((pog) => {
        expect(pog.playtimeSeconds).to.be.greaterThan(
          0,
          `Playtime should be greater than 0 after disconnecting, current playtime: ${pog.playtimeSeconds}`,
        );
      });
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
