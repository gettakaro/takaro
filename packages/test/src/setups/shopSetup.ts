import { Client, ShopListingOutputDTO, UserOutputDTO } from '@takaro/apiclient';
import { IModuleTestsSetupData, modulesTestSetup } from './modulesSetup.js';
import { integrationConfig } from '../test/integrationConfig.js';
import { expect } from '../test/expect.js';
import { EventsAwaiter } from '../test/waitForEvents.js';
import { IntegrationTest } from '../integrationTest.js';
import { faker } from '@faker-js/faker';

export interface IShopSetup extends IModuleTestsSetupData {
  userClient: Client;
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
}

async function createUserForPlayer(client: Client, playerId: string, gameServerId: string) {
  const password = 'shop-tester-password-very-safe';

  let user: UserOutputDTO | null = null;

  user = (
    await client.user.userControllerCreate({
      name: 'test',
      email: `test-${faker.internet.email()}`,
      password,
    })
  ).data.data;

  const userClient = new Client({ auth: { username: user.email, password }, url: integrationConfig.get('host') });
  await userClient.login();

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(client);
  const chatEventWaiter = eventsAwaiter.waitForEvents('chat-message');
  await client.command.commandControllerTrigger(gameServerId, {
    msg: '/link',
    playerId,
  });
  const chatEvents = await chatEventWaiter;
  expect(chatEvents).to.have.length(1);
  const code = chatEvents[0].data.meta.msg.match(/code=(\w+-\w+-\w+)/)[1];
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email, code });

  return {
    user,
    client: userClient,
  };
}

async function setupShop(client: Client, gameServerId: string) {
  const items = (await client.item.itemControllerSearch()).data.data;

  const listing100Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: items[0].id, amount: 1 }],
    price: 100,
    name: 'Test item',
  });

  const listing33Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: items[1].id, amount: 1 }],
    price: 33,
    name: 'Test item 2',
  });

  return {
    listing100: listing100Res.data.data,
    listing33: listing33Res.data.data,
  };
}

export const shopSetup = async function (this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await modulesTestSetup.bind(this as unknown as IntegrationTest<IModuleTestsSetupData>)();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameserver.id,
  });

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
  });
  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameserver.id,
    value: 'test coin',
  });

  await this.client.gameserver.gameServerControllerInstallModule(
    setupData.gameserver.id,
    setupData.economyUtilsModule.id,
  );

  const { client: userClient } = await createUserForPlayer(
    this.client,
    setupData.players[0].id,
    setupData.gameserver.id,
  );
  const { listing100, listing33 } = await setupShop(this.client, setupData.gameserver.id);

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[0].id,
    { currency: 250 },
  );

  return { ...setupData, userClient, listing100, listing33 };
};
