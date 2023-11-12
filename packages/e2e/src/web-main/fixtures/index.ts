import playwright from '@playwright/test';
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
import humanId from 'human-id/dist/index.js';
import { ModuleDefinitionsPage, StudioPage, GameServersPage } from '../pages/index.js';
import { EventTypes } from '@takaro/modules';
import { getAdminClient, login } from './helpers.js';

export enum PERMISSIONS {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_FUNCTIONS' = 'READ_FUNCTIONS',
  'MANAGE_FUNCTIONS' = 'MANAGE_FUNCTIONS',
  'READ_CRONJOBS' = 'READ_CRONJOBS',
  'MANAGE_CRONJOBS' = 'MANAGE_CRONJOBS',
  'READ_HOOKS' = 'READ_HOOKS',
  'MANAGE_HOOKS' = 'MANAGE_HOOKS',
  'READ_COMMANDS' = 'READ_COMMANDS',
  'MANAGE_COMMANDS' = 'MANAGE_COMMANDS',
  'READ_MODULES' = 'READ_MODULES',
  'MANAGE_MODULES' = 'MANAGE_MODULES',
  'READ_PLAYERS' = 'READ_PLAYERS',
  'MANAGE_PLAYERS' = 'MANAGE_PLAYERS',
  'MANAGE_SETTINGS' = 'MANAGE_SETTINGS',
  'READ_SETTINGS' = 'READ_SETTINGS',
  'READ_VARIABLES' = 'READ_VARIABLES',
  'MANAGE_VARIABLES' = 'MANAGE_VARIABLES',
  'READ_EVENTS' = 'READ_EVENTS',
  'MANAGE_EVENTS' = 'MANAGE_EVENTS',
}

const { test: base } = playwright;

export interface IBaseFixtures {
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
    testUser: UserOutputDTO & { password: string; role: RoleOutputDTO };
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
      const user = await client.user.userControllerCreate({
        name: 'test',
        email: `e2e-${humanId.default()}@example.com`.slice(0, 49),
        password,
      });

      const emptyRole = await client.role.roleControllerCreate({
        name: 'test',
        permissions: [],
      });
      client.user.userControllerAssignRole(user.data.data.id, emptyRole.data.data.id);

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
        testUser: { ...user.data.data, password, role: emptyRole.data.data },
      });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(domain.createdDomain.id);
    },
    { auto: true },
  ],
});

export interface WithModuleFixture {
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
