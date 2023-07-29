import playwright, { Page } from '@playwright/test';
import {
  AdminClient,
  Client,
  GameServerCreateDTOTypeEnum,
  HookCreateDTOEventTypeEnum,
  ModuleOutputDTO,
} from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import humanId from 'human-id/dist/index.js';
import { ModuleDefinitionsPage } from './ModuleDefinitionsPage.js';
import { StudioPage } from './StudioPage.js';

const { expect, test: base } = playwright;

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('hi cutie').click();
  await page.getByPlaceholder('hi cutie').fill(username);
  await page.getByPlaceholder('hi cutie').press('Tab');
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
    builtinModule: ModuleOutputDTO;
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

      await client.gameserver.gameServerControllerCreate({
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

      const mods = await client.module.moduleControllerSearch({ filters: { name: 'utils' } });

      await use({
        client,
        adminClient,
        builtinModule: mods.data.data[0],
        studioPage: new StudioPage(page, mod.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
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

      await client.gameserver.gameServerControllerCreate({
        name: 'Test server',
        type: GameServerCreateDTOTypeEnum.Mock,
        connectionInfo: JSON.stringify({
          host: integrationConfig.get('mockGameserver.host'),
        }),
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

      const mods = await client.module.moduleControllerSearch({ filters: { name: ['utils'] } });

      await use({
        client,
        adminClient,
        builtinModule: mods.data.data[0],
        studioPage: new StudioPage(page, mod.data.data),
        moduleDefinitionsPage: new ModuleDefinitionsPage(page),
      });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(data.createdDomain.id);
    },
    { auto: true },
  ],
});
