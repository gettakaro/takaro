import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { IGamePlayer } from '@takaro/modules';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { v4 as uuid } from 'uuid';
import { PlayerService } from '../../service/PlayerService.js';

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

      const MOCK_PLAYER = await new IGamePlayer().construct({
        ip: '169.169.169.80',
        name: 'brunkel',
        gameId: uuid(),
        steamId: '76561198021481871',
      });

      await playerService.sync(MOCK_PLAYER, this.setupData.id);

      const players = await this.client.player.playerControllerSearch();

      const player = players.data.data.find((player) => player.steamId === MOCK_PLAYER.steamId);

      expect(player).to.not.be.null;
      expect(player?.steamId).to.eq(MOCK_PLAYER.steamId);

      return players;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
