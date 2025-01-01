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
import { ModuleDefinitionsPage, ModuleBuilderPage, GameServersPage, UsersPage, RolesPage } from '../pages/index.js';
import { getAdminClient, login } from '../helpers.js';
import { PlayerProfilePage } from '../pages/PlayerProfile.js';

global.afterEach = () => { };
globalThis.afterEach = () => { };
global.before = () => { };

export interface IBaseFixtures {
  takaro: {
    rootClient: Client;
    adminClient: AdminClient;
    moduleBuilderPage: ModuleBuilderPage;
    moduleDefinitionsPage: ModuleDefinitionsPage;
    GameServersPage: GameServersPage;
    usersPage: UsersPage;
    builtinModule: ModuleOutputDTO;
    gameServer: GameServerOutputDTO;
    rolesPage: RolesPage;
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

      const [user, emptyRole, gameServer, mod, mods] = await Promise.all([
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
        client.gameserver.gameServerControllerCreate({
          name: 'Test server',
          type: GameServerCreateDTOTypeEnum.Mock,
          connectionInfo: JSON.stringify({
            host: integrationConfig.get('mockGameserver.host'),
          }),
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
        client.module.moduleControllerSearch({ filters: { name: ['utils'] } }),
      ]);

      // enable developer mode by default
      await client.settings.settingsControllerSet('developerMode', { value: 'true' });

      // assign role to user
      await client.user.userControllerAssignRole(user.data.data.id, emptyRole.data.data.id);

      await use({
        rootClient: client,
        adminClient,
        builtinModule: mods.data.data[0],
        gameServer: gameServer.data.data,
        moduleBuilderPage: new ModuleBuilderPage(page, mod.data.data),
        GameServersPage: new GameServersPage(page, gameServer.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
        usersPage: new UsersPage(page),
        rolesPage: new RolesPage(page),
        mailhog: new MailhogAPI({
          baseURL: 'http://127.0.0.1:8025',
        }),
        domain,
        rootUser: domain.rootUser,
        testUser: { ...user.data.data, password, role: emptyRole.data.data },
      });

      // fixture teardown
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
