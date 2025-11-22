import { test as pwTest } from '@playwright/test';
import { MailhogAPI, integrationConfig, EventsAwaiter } from '@takaro/test';
import {
  AdminClient,
  Client,
  DomainCreateOutputDTO,
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  HookCreateDTOEventTypeEnum,
  ModuleOutputDTO,
  PlayerOutputDTO,
  RoleOutputDTO,
  UserOutputDTO,
} from '@takaro/apiclient';
import { humanId } from 'human-id';
import {
  ModuleDefinitionsPage,
  ModuleBuilderPage,
  GameServersPage,
  UsersPage,
  RolesPage,
  ShopCategoriesPage,
  ShopPage,
  ShopListingPage,
} from '../pages/index.js';
import { getAdminClient, login } from '../helpers.js';
import { PlayerProfilePage } from '../pages/PlayerProfile.js';
import { ModuleInstallationsPage } from '../pages/ModuleInstallationsPage.js';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';
import { setupShopCategories } from './shopCategoriesSetup.js';

global.afterEach = () => {};
globalThis.afterEach = () => {};
global.before = () => {};

export interface IBaseFixtures {
  takaro: {
    rootClient: Client;
    adminClient: AdminClient;
    moduleBuilderPage: ModuleBuilderPage;
    moduleDefinitionsPage: ModuleDefinitionsPage;
    moduleInstallationsPage: ModuleInstallationsPage;
    GameServersPage: GameServersPage;
    usersPage: UsersPage;
    builtinModule: ModuleOutputDTO;
    gameServer: GameServerOutputDTO;
    rolesPage: RolesPage;
    shopCategoriesPage: ShopCategoriesPage;
    shopPage: ShopPage;
    shopListingPage: ShopListingPage;
    mailhog: MailhogAPI;
    rootUser: UserOutputDTO;
    testUser: UserOutputDTO & { password: string; role: RoleOutputDTO };
    domain: DomainCreateOutputDTO;
  };
}

const main = pwTest.extend<IBaseFixtures>({
  takaro: [
    async ({ page }, use) => {
      const adminClient = getAdminClient();
      const domain = (
        await adminClient.domain.domainControllerCreate({
          name: `e2e-${humanId()}`.slice(0, 49),
          maxGameservers: 10,
          maxUsers: 10,
          maxModules: 1000,
          maxVariables: 1000,
        })
      ).data.data;

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: domain.rootUser.email,
          password: domain.password,
        },
      });
      await client.login();

      // User with no permissions
      const password = 'test';

      const identityToken = 'Test server';

      const [user, emptyRole, mockServer, mod, mods] = await Promise.all([
        // User creation
        client.user.userControllerCreate({
          name: 'test',
          email: `e2e-${humanId()}@example.com`.slice(0, 49),
          password: 'test',
        }),

        // Empty role creation
        client.role.roleControllerCreate({
          name: 'Test role',
          permissions: [],
        }),

        // Game server creation
        getMockServer({
          mockserver: {
            registrationToken: domain.createdDomain.serverRegistrationToken,
            identityToken,
          },
        }),

        // Module creation
        client.module.moduleControllerCreate({
          name: 'Module without functions',
          latestVersion: {
            description: 'Empty module with no functions',
            configSchema: JSON.stringify({}),
          },
        }),

        // Get builtin module
        client.module.moduleControllerSearch({ filters: { name: ['highPingKicker'] } }),
      ]);

      const gameServerRes = await client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [identityToken] },
      });
      const gameServer = gameServerRes.data.data.find((gs) => gs.identityToken === identityToken);
      if (!gameServer) throw new Error('Game server not found, setup did not work?');

      // enable developer mode by default
      await client.settings.settingsControllerSet('developerMode', { value: 'true' });

      // get versionId of the module
      const versionId = (
        await client.module.moduleVersionControllerSearchVersions({
          filters: { moduleId: [mods.data.data[0].id] },
        })
      ).data.data.find((smallVersion) => smallVersion.tag !== 'latest')?.id!;

      // Install utils module
      await client.module.moduleInstallationsControllerInstallModule({
        versionId,
        gameServerId: gameServer.id,
      });

      // assign role to user
      await client.user.userControllerAssignRole(user.data.data.id, emptyRole.data.data.id);

      // Setup shop categories for tests
      await setupShopCategories(client);

      await use({
        rootClient: client,
        adminClient,
        builtinModule: mods.data.data[0],
        gameServer: gameServer,
        moduleBuilderPage: new ModuleBuilderPage(page, mod.data.data),
        GameServersPage: new GameServersPage(page, gameServer),
        moduleInstallationsPage: new ModuleInstallationsPage(page, gameServer),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
        usersPage: new UsersPage(page),
        rolesPage: new RolesPage(page),
        shopCategoriesPage: new ShopCategoriesPage(page, gameServer.id),
        shopPage: new ShopPage(page, gameServer.id),
        shopListingPage: new ShopListingPage(page, gameServer.id),
        mailhog: new MailhogAPI({
          baseURL: 'http://127.0.0.1:8025',
        }),
        domain,
        rootUser: domain.rootUser,
        testUser: { ...user.data.data, password, role: emptyRole.data.data },
      });

      // fixture teardown
      try {
        await mockServer.shutdown();
      } catch (error) {
        console.warn('Failed to shutdown mock server during E2E teardown:', error);
      }
      await adminClient.domain.domainControllerRemove(domain.createdDomain.id);
    },
    { auto: true },
  ],
});

// this uses the root user
export const test = main.extend({
  takaro: async ({ takaro, page }, use) => {
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await use(takaro);
  },
});

// NO Permissions user test
export const userTest = main.extend({
  takaro: async ({ takaro, page }, use) => {
    await login(page, takaro.testUser.email, takaro.testUser.password);
    await use(takaro);
  },
});

export interface ExtendedFixture {
  extended: {
    mod: ModuleOutputDTO;
    players: PlayerOutputDTO[];
    PlayerProfilePage: PlayerProfilePage;
  };
}

export const extendedTest = main.extend<ExtendedFixture>({
  extended: [
    async ({ takaro, page }, use) => {
      const { rootUser, domain, gameServer, rootClient } = takaro;

      // required to add players to the gameserver
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(rootClient);
      const connectedEvents = eventAwaiter.waitForEvents('player-connected');

      // this creates a bunch of players
      await rootClient.gameserver.gameServerControllerExecuteCommand(gameServer.id, {
        command: 'connectAll',
      });

      await login(page, rootUser.email, domain.password);

      const modCreateResult = await rootClient.module.moduleControllerCreate({
        name: 'Module with functions',
        latestVersion: {
          description: 'Module with functions',
          configSchema: JSON.stringify({}),
        },
      });
      const mod = modCreateResult.data.data;

      // create command, hook and cronjob and function
      await Promise.all([
        rootClient.command.commandControllerCreate({
          versionId: mod.latestVersion.id,
          name: 'my-command',
          trigger: 'test',
        }),
        rootClient.hook.hookControllerCreate({
          versionId: mod.latestVersion.id,
          name: 'my-hook',
          regex: 'test',
          eventType: HookCreateDTOEventTypeEnum.Log,
        }),
        rootClient.cronjob.cronJobControllerCreate({
          versionId: mod.latestVersion.id,
          name: 'my-cron',
          temporalValue: '* * * * *',
        }),
        rootClient.function.functionControllerCreate({
          name: 'my-function',
          versionId: mod.latestVersion.id,
        }),
      ]);
      takaro.moduleBuilderPage.mod = mod;
      await connectedEvents;
      const players = (await rootClient.player.playerControllerSearch()).data.data;

      await use({
        mod,
        PlayerProfilePage: new PlayerProfilePage(page, players[0]),
        players: players,
      });
    },
    { auto: true },
  ],
});
