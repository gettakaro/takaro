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
import { ModuleDefinitionsPage, StudioPage, GameServersPage, UsersPage, RolesPage } from '../pages/index.js';
import { getAdminClient, login } from '../helpers.js';
import { PlayerProfilePage } from '../pages/PlayerProfile.js';

global.afterEach = () => {};
globalThis.afterEach = () => {};
global.before = () => {};

export interface IBaseFixtures {
  takaro: {
    rootClient: Client;
    adminClient: AdminClient;
    studioPage: StudioPage;
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
          configSchema: JSON.stringify({}),
          description: 'Empty module with no functions',
        }),

        // Get builtin module
        client.module.moduleControllerSearch({ filters: { name: ['utils'] } }),
      ]);

      // assign role to user
      await client.user.userControllerAssignRole(user.data.data.id, emptyRole.data.data.id);

      await use({
        rootClient: client,
        adminClient,
        builtinModule: mods.data.data[0],
        gameServer: gameServer.data.data,
        studioPage: new StudioPage(page, mod.data.data),
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

      const mod = await rootClient.module.moduleControllerCreate({
        name: 'Module with functions',
        configSchema: JSON.stringify({}),
        description: 'Module with functions',
      });

      // create command, hook and cronjob
      await Promise.all([
        rootClient.command.commandControllerCreate({
          moduleId: mod.data.data.id,
          name: 'my-command',
          trigger: 'test',
        }),
        rootClient.hook.hookControllerCreate({
          moduleId: mod.data.data.id,
          name: 'my-hook',
          regex: 'test',
          eventType: HookCreateDTOEventTypeEnum.Log,
        }),
        rootClient.cronjob.cronJobControllerCreate({
          moduleId: mod.data.data.id,
          name: 'my-cron',
          temporalValue: '* * * * *',
        }),
      ]);
      takaro.studioPage.mod = mod.data.data;
      await connectedEvents;
      const players = (await rootClient.player.playerControllerSearch()).data.data;

      await use({
        mod: mod.data.data,
        PlayerProfilePage: new PlayerProfilePage(page, players[0]),
        players: players,
      });
    },
    { auto: true },
  ],
});
