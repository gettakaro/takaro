import { EventsAwaiter, IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';
import { GameEvents, IGamePlayer } from '@takaro/modules';
import { v4 as uuid } from 'uuid';
import { PlayerService } from '../../service/Player/index.js';
import { sleep } from '@takaro/util';
import { describe } from 'node:test';
import { faker } from '@faker-js/faker';

const group = 'Event worker';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Handles player joined event correctly',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'brunkel',
        gameId: uuid(),
        steamId: '76561198021481871',
      });

      await playerService.resolveRef(MOCK_PLAYER, this.setupData.gameServer1.id);

      const players = await this.client.player.playerControllerSearch();

      const player = players.data.data.find((player) => player.steamId === MOCK_PLAYER.steamId);

      expect(player).to.not.be.null;
      expect(player?.steamId).to.eq(MOCK_PLAYER.steamId);

      return players;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Handles player syncing correctly when same gameId exists for different servers',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'jefke',
        gameId: '42',
        steamId: faker.string.alphanumeric(16),
      });

      await playerService.resolveRef(MOCK_PLAYER, this.setupData.gameServer1.id);
      await playerService.resolveRef(MOCK_PLAYER, this.setupData.gameServer2.id);

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

      expect(originalPogs.data.data).to.have.lengthOf(10);
      // Should all have 0 playtime
      originalPogs.data.data.forEach((pog) => {
        expect(pog.playtimeSeconds).to.eq(0, 'Playtime should be 0 at start of test');
      });

      const connectedEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.PLAYER_CONNECTED,
        10,
      );
      // First, make sure all players are online
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: 'connectAll',
      });

      expect(await connectedEvents).to.have.lengthOf(10);

      // Wait a second, to ensure there's a noticeable difference in playtime
      await sleep(1000);

      // Disconnect all the players, and wait for the events
      // This will trigger the logic of increasing playtime
      const disconnectedEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.PLAYER_DISCONNECTED,
        10,
      );
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: 'disconnectAll',
      });

      expect(await disconnectedEvents).to.have.lengthOf(10);
      // Playtime calc happens AFTER the event is handled, so we need to wait a bit
      await sleep(500);

      const updatedPogs = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(updatedPogs.data.data).to.have.lengthOf(10);
      // Should all have a playtime greater than 0
      // Due to the async nature of tests, we don't have tight control over the exact playtime
      // So just a simple check to see if it's greater than 0 is enough
      updatedPogs.data.data.forEach((pog) => {
        expect(pog.playtimeSeconds).to.be.greaterThan(
          0,
          `Playtime should be greater than 0 after disconnecting, current playtime: ${pog.playtimeSeconds}`,
        );
      });

      // The global player playtime should be updated as well
      const players = await this.client.player.playerControllerSearch({
        filters: { id: updatedPogs.data.data.map((pog) => pog.playerId) },
      });
      expect(players.data.data).to.have.lengthOf(10);
      players.data.data.forEach((player) => {
        expect(player.playtimeSeconds).to.be.greaterThan(
          0,
          `Playtime should be greater than 0 after disconnecting, current playtime: ${player.playtimeSeconds}`,
        );
      });
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Handles player joined event correctly with platformId',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'minecraft_player',
        gameId: uuid(),
        platformId: 'minecraft:test-player-uuid',
      });

      await playerService.resolveRef(MOCK_PLAYER, this.setupData.gameServer1.id);

      const players = await this.client.player.playerControllerSearch();

      const player = players.data.data.find((player) => player.platformId === MOCK_PLAYER.platformId);

      expect(player).to.not.be.null;
      expect(player?.platformId).to.eq(MOCK_PLAYER.platformId);
      expect(player?.name).to.eq(MOCK_PLAYER.name);

      return players;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Finds existing player by platformId when resolving reference',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      // Create a player with platformId first
      const MOCK_PLAYER_1 = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'original_name',
        gameId: uuid(),
        platformId: 'minecraft:existing-player-uuid',
      });

      await playerService.resolveRef(MOCK_PLAYER_1, this.setupData.gameServer1.id);

      // Now try to resolve with the same platformId but different gameId and name
      const MOCK_PLAYER_2 = new IGamePlayer({
        ip: '169.169.169.81',
        name: 'updated_name',
        gameId: uuid(),
        platformId: 'minecraft:existing-player-uuid',
      });

      await playerService.resolveRef(MOCK_PLAYER_2, this.setupData.gameServer2.id);

      const players = await this.client.player.playerControllerSearch({
        filters: {
          platformId: [MOCK_PLAYER_1.platformId as string],
        },
      });

      // Should find only one player (the existing one, updated with new name)
      expect(players.data.data).to.have.lengthOf(1);
      expect(players.data.data[0].platformId).to.eq(MOCK_PLAYER_1.platformId);
      expect(players.data.data[0].name).to.eq(MOCK_PLAYER_2.name); // Should be updated
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Throws ValidationError when no platform identifiers are provided',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const playerService = new PlayerService(this.standardDomainId ?? '');

      const MOCK_PLAYER = new IGamePlayer({
        ip: '169.169.169.80',
        name: 'no_id_player',
        gameId: uuid(),
        // No platform identifiers provided
      });

      let errorThrown = false;
      try {
        await playerService.resolveRef(MOCK_PLAYER, this.setupData.gameServer1.id);
      } catch (error: any) {
        errorThrown = true;
        expect(error.message).to.include('At least one platform identifier');
      }

      expect(errorThrown).to.be.true;
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
