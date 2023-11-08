import playwright from '@playwright/test';
import { MailhogAPI, integrationConfig, EventsAwaiter } from '@takaro/test';
import { PERMISSIONS } from '@takaro/lib-components';
import {
  AdminClient,
  Client,
  DomainCreateOutputDTO,
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  HookCreateDTOEventTypeEnum,
  ModuleOutputDTO,
  PlayerOutputDTO,
  UserOutputDTO,
} from '@takaro/apiclient';
import humanId from 'human-id/dist/index.js';
import { GameServersPage } from '../pages/GameServersPage.js';
import { ModuleDefinitionsPage } from '../pages/ModuleDefinitionsPage.js';
import { StudioPage } from './StudioPage.js';
import { EventTypes } from '@takaro/modules';
import { getAdminClient, login } from './helpers.js';

const { test: base } = playwright;

interface IBaseFixtures {
  takaro: {
    rootClient: Client;
    adminClient: AdminClient;
    studioPage: StudioPage;
    moduleDefinitionsPage: ModuleDefinitionsPage;
    GameServersPage: GameServersPage;
    builtinModule: ModuleOutputDTO;
    gameServer: GameServerOutputDTO;
    mailhog: MailhogAPI;
    players: PlayerOutputDTO[];
    rootUser: UserOutputDTO;
    domain: DomainCreateOutputDTO;
  };
}

export const basicTest = base.extend<IBaseFixtures>({
  takaro: [
    async ({ page }, use) => {
      const adminClient = getAdminClient();
      const domain = (
        await adminClient.domain.domainControllerCreate({
          name: `e2e-${humanId.default()}`.slice(0, 49),
        })
      ).data.data;

      await login(page, domain.rootUser.email, domain.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: domain.rootUser.email,
          password: domain.password,
        },
      });
      await client.login();
      const gameServer = await client.gameserver.gameServerControllerCreate({
        name: 'Test server',
        type: GameServerCreateDTOTypeEnum.Mock,
        connectionInfo: JSON.stringify({
          host: integrationConfig.get('mockGameserver.host'),
        }),
      });

      // empty module
      const mod = await client.module.moduleControllerCreate({
        name: 'Module without functions',
        configSchema: JSON.stringify({}),
        description: 'Empty module with no functions',
      });
      const mods = await client.module.moduleControllerSearch({ filters: { name: ['utils'] } });

      await use({
        rootClient: client,
        adminClient,
        builtinModule: mods.data.data[0],
        gameServer: gameServer.data.data,
        studioPage: new StudioPage(page, mod.data.data),
        GameServersPage: new GameServersPage(page, gameServer.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
        mailhog: new MailhogAPI({
          baseURL: integrationConfig.get('mailhog.url'),
        }),
        domain,
        players: [],
        rootUser: domain.rootUser,
      });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(domain.createdDomain.id);
    },
    { auto: true },
  ],
});

interface WithModuleFixture {
  module: ModuleOutputDTO;
}

export const test = basicTest.extend<WithModuleFixture>({
  module: [
    async ({ takaro, page }, use) => {
      const { rootUser, domain, gameServer } = takaro;
      await login(page, rootUser.email, domain.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: rootUser.email,
          password: domain.password,
        },
      });
      await client.login();

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(client);
      const connectedEvents = eventAwaiter.waitForEvents(EventTypes.PLAYER_CONNECTED);
      await client.gameserver.gameServerControllerExecuteCommand(gameServer.id, {
        command: 'connectAll',
      });

      const mod = await client.module.moduleControllerCreate({
        name: 'Module with functions',
        configSchema: JSON.stringify({}),
        description: 'Module with functions',
      });

      await client.command.commandControllerCreate({
        moduleId: mod.data.data.id,
        name: 'my-command',
        trigger: 'test',
      });

      await client.hook.hookControllerCreate({
        moduleId: mod.data.data.id,
        name: 'my-hook',
        regex: 'test',
        eventType: HookCreateDTOEventTypeEnum.Log,
      });

      await client.cronjob.cronJobControllerCreate({
        moduleId: mod.data.data.id,
        name: 'my-cron',
        temporalValue: '* * * * *',
      });
      await connectedEvents;
      await use(mod.data.data);
    },
    { auto: true },
  ],
});

interface UserFixtures {
  user: {
    user: UserOutputDTO;
    userClient: Client;
  };
}

export function createTestFnWithUserPermissions(permissions: PERMISSIONS[]) {
  return basicTest.extend<UserFixtures>({
    user: [
      async ({ takaro, page }, use) => {
        const { rootUser, domain } = takaro;
        const client = new Client({
          url: integrationConfig.get('host'),
          auth: {
            username: rootUser.email,
            password: domain.password,
          },
        });
        await client.login();

        const password = 'test';
        const user = (
          await client.user.userControllerCreate({
            email: `e2e-${humanId.default()}@takaro.io`,
            password,
            name: 'test',
          })
        ).data.data;

        const role = (
          await client.role.roleControllerCreate({
            name: `e2e-${humanId.default()}`,
            permissions,
          })
        ).data.data;

        await client.user.userControllerAssignRole(user.id, role.id);
        client.logout();

        const userClient = new Client({
          url: integrationConfig.get('host'),
          auth: {
            username: user.email,
            password,
          },
        });
        userClient.login();
        await login(page, user.email, password);
        await use({ user, userClient });

        // the base fixture removes the domain which will remove the user
      },
      { auto: true },
    ],
  });
}
