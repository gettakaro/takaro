import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/gameEvents.js';
import { randomUUID } from 'crypto';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Cross-server player commands';

interface CrossServerSetupData extends IModuleTestsSetupData {
  server2: GameServerOutputDTO;
  sharedSteamId: string;
  sharedPlayerOnServer2: any;
}

const crossServerPlayerSetup = async function (
  this: IntegrationTest<CrossServerSetupData>,
): Promise<CrossServerSetupData> {
  const setupRes = await modulesTestSetup.bind(this as unknown as IntegrationTest<IModuleTestsSetupData>)();
  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  // Create a second server
  const server2IdentityToken = randomUUID();
  await this.createMockServer({
    mockserver: {
      registrationToken: this.domainRegistrationToken,
      identityToken: server2IdentityToken,
    },
  });

  // Wait for the second server to be registered
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Find the second server
  const gameServersRes = await this.client.gameserver.gameServerControllerSearch({
    filters: { identityToken: [server2IdentityToken] },
  });
  const server2 = gameServersRes.data.data[0];

  // Create a module with a command that uses player argument
  const moduleRes = await this.client.module.moduleControllerCreate({
    name: 'cross-server-test',
  });

  await this.client.command.commandControllerCreate({
    name: 'playerinfo',
    trigger: 'playerinfo',
    versionId: moduleRes.data.data.latestVersion.id,
    arguments: [{ name: 'targetPlayer', type: 'player', position: 0 }],
    function: `import { getTakaro, getData } from '@takaro/helpers';

    async function main() {
      const data = await getData();
      const takaro = await getTakaro(data);
      const { arguments: args } = data;
      
      // Get the target player info
      // targetPlayer is a PlayerOnGameserver object from the command argument resolution
      const targetPlayer = args.targetPlayer;
      
      // Search for all PlayerOnGameserver records for this player
      const pogsSearch = await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          playerId: [targetPlayer.playerId]
        }
      });
      
      const serverCount = pogsSearch.data.data.length;
      const serverNames = [];
      
      // Get server names for each POG
      for (const pog of pogsSearch.data.data) {
        const serverRes = await takaro.gameserver.gameServerControllerGetOne(pog.gameServerId);
        if (serverRes.data.data) {
          serverNames.push(serverRes.data.data.name);
        }
      }
      
      await data.player.pm(\`Player \${targetPlayer.name} (Steam ID: \${targetPlayer.steamId}) exists on \${serverCount} server(s): \${serverNames.join(', ')}\`);
    }
    
    await main();`,
  });

  // Install module on both servers
  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: setupRes.gameserver.id,
    versionId: moduleRes.data.data.latestVersion.id,
  });

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: server2.id,
    versionId: moduleRes.data.data.latestVersion.id,
  });

  // Define a shared Steam ID
  const sharedSteamId = '76561198000000001';

  // Create a player with the same Steam ID on both servers
  await this.client.gameserver.gameServerControllerExecuteCommand(setupRes.gameserver.id, {
    command: `createPlayer player1 {"name": "SharedPlayer", "steamId": "${sharedSteamId}", "online": true}`,
  });

  await this.client.gameserver.gameServerControllerExecuteCommand(server2.id, {
    command: `createPlayer player2 {"name": "SharedPlayer", "steamId": "${sharedSteamId}", "online": true}`,
  });

  // Wait for players to be created and synced
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Get the PlayerOnGameserver for SharedPlayer on server2 to use as command executor
  const server2Players = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
    filters: {
      gameServerId: [server2.id],
      gameId: ['player2'],
    },
  });

  const sharedPlayerOnServer2 = server2Players.data.data[0];

  return {
    ...setupRes,
    server2,
    sharedSteamId,
    sharedPlayerOnServer2,
  };
};

const tests = [
  new IntegrationTest<CrossServerSetupData>({
    name: 'Can target a player that exists on multiple servers using Steam ID',
    group,
    snapshot: false,
    setup: crossServerPlayerSetup,
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger command on server1 targeting the shared player by Steam ID
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/playerinfo ${this.setupData.sharedSteamId}`,
        playerId: this.setupData.players[0].id,
      });

      const chatEvents = await events;
      expect(chatEvents.length).to.be.eq(1);
      expect(chatEvents[0].data.meta.msg).to.include('exists on 2 server(s)');
      expect(chatEvents[0].data.meta.msg).to.include(this.setupData.gameserver.name);
      expect(chatEvents[0].data.meta.msg).to.include(this.setupData.server2.name);
    },
  }),

  new IntegrationTest<CrossServerSetupData>({
    name: 'Can target a player by name when they exist on multiple servers',
    group,
    snapshot: false,
    setup: crossServerPlayerSetup,
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger command on server2 targeting the shared player by name
      await this.client.command.commandControllerTrigger(this.setupData.server2.id, {
        msg: '/playerinfo SharedPlayer',
        playerId: this.setupData.sharedPlayerOnServer2.playerId,
      });

      const chatEvents = await events;
      expect(chatEvents.length).to.be.eq(1);
      expect(chatEvents[0].data.meta.msg).to.include('exists on 2 server(s)');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
