import playwright, { Page } from '@playwright/test';
import { MailhogAPI, integrationConfig, EventsAwaiter } from '@takaro/test';
import {
  AdminClient,
  Client,
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  HookCreateDTOEventTypeEnum,
  ModuleOutputDTO,
  PlayerOutputDTO,
  UserOutputDTO,
} from '@takaro/apiclient';
import humanId from 'human-id/dist/index.js';
import { GameServersPage } from './GameServersPage.js';
import { ModuleDefinitionsPage } from './ModuleDefinitionsPage.js';
import { StudioPage } from './StudioPage.js';
import { EventTypes } from '@takaro/modules';

const { expect, test: base } = playwright;

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill(username);
  emailInput.press('Tab');
  await emailInput.press('Tab');
  await page.getByLabel('PasswordRequired').fill(password);
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await expect(page.getByRole('link', { name: 'Takaro' })).toBeVisible();
}

export const getAdminClient = () => {
  return new AdminClient({
    url: integrationConfig.get('host'),
    auth: {
      clientId: integrationConfig.get('auth.adminClientId'),
      clientSecret: integrationConfig.get('auth.adminClientSecret'),
    },
    OAuth2URL: integrationConfig.get('auth.OAuth2URL'),
  });
};

interface IFixtures {
  takaro: {
    client: Client;
    adminClient: AdminClient;
    studioPage: StudioPage;
    moduleDefinitionsPage: ModuleDefinitionsPage;
    GameServersPage: GameServersPage;
    builtinModule: ModuleOutputDTO;
    gameServer: GameServerOutputDTO;
    mailhog: MailhogAPI;
    players: PlayerOutputDTO[];
    rootUser: UserOutputDTO;
  };
}

export const basicTest = base.extend<IFixtures>({
  takaro: [
    async ({ page }, use) => {
      // fixture setup
      const adminClient = getAdminClient();
      const createdDomainRes = await adminClient.domain.domainControllerCreate({
        name: `e2e-${humanId.default()}`.slice(0, 49),
      });

      const data = createdDomainRes.data.data;
      await login(page, data.rootUser.email, data.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: data.rootUser.email,
          password: data.password,
        },
      });
      await client.login();

      const mailhog = new MailhogAPI({
        baseURL: integrationConfig.get('mailhog.url'),
      });

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
        client,
        adminClient,
        builtinModule: mods.data.data[0],
        gameServer: gameServer.data.data,
        studioPage: new StudioPage(page, mod.data.data),
        GameServersPage: new GameServersPage(page, gameServer.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
        mailhog,
        players: [],
        rootUser: data.rootUser,
      });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(data.createdDomain.id);
    },
    { auto: true },
  ],
});

export const test = base.extend<IFixtures>({
  takaro: [
    async ({ page }, use) => {
      const adminClient = getAdminClient();
      const createdDomainRes = await adminClient.domain.domainControllerCreate({
        name: `e2e-${humanId.default()}`.slice(0, 49),
      });

      const data = createdDomainRes.data.data;
      await login(page, data.rootUser.email, data.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: data.rootUser.email,
          password: data.password,
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

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(client);

      const connectedEvents = eventAwaiter.waitForEvents(EventTypes.PLAYER_CONNECTED);

      await client.gameserver.gameServerControllerExecuteCommand(gameServer.data.data.id, {
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

      const mailhog = new MailhogAPI({
        baseURL: integrationConfig.get('mailhog.url'),
      });

      await connectedEvents;

      const players = await client.player.playerControllerSearch();

      /* TODO: should probably add more custom modules with complex config schemas
       * probably a good idea to add one for each type of config field
       */

      const mods = await client.module.moduleControllerSearch({ filters: { name: ['utils'] } });

      await use({
        client,
        adminClient,
        builtinModule: mods.data.data[0],
        studioPage: new StudioPage(page, mod.data.data),
        GameServersPage: new GameServersPage(page, gameServer.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
        mailhog,
        gameServer: gameServer.data.data,
        players: players.data.data,
        rootUser: data.rootUser,
      });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(data.createdDomain.id);
    },
    { auto: true },
  ],
});
