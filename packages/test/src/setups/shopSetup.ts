import { Client, ItemsOutputDTO, ShopListingOutputDTO, UserOutputDTO } from '@takaro/apiclient';
import { IModuleTestsSetupData, modulesTestSetup } from './modulesSetup.js';
import { integrationConfig } from '../test/integrationConfig.js';
import { expect } from '../test/expect.js';
import { EventsAwaiter } from '../test/waitForEvents.js';
import { IntegrationTest } from '../integrationTest.js';
import { faker } from '@faker-js/faker';
import { getSecretCodeForPlayer } from './createUserForPlayer.js';

export interface IShopSetup extends IModuleTestsSetupData {
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
  createListings: (client: Client, opts: ICreateListingsOpts) => Promise<ShopListingOutputDTO[]>;
  items: ItemsOutputDTO[];
  items2: ItemsOutputDTO[];
  user1: UserOutputDTO;
  client1: Client;
  user2: UserOutputDTO;
  client2: Client;
  user3: UserOutputDTO;
  client3: Client;
  user4: UserOutputDTO;
  client4: Client;
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
  const code = await getSecretCodeForPlayer(playerId);
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email!, code });

  return {
    user,
    client: userClient,
  };
}

async function setupShop(client: Client, gameServerId: string) {
  const items = (
    await client.item.itemControllerSearch({
      sortBy: 'code',
      sortDirection: 'asc',
      filters: { gameserverId: [gameServerId] },
    })
  ).data.data;

  const stoneItem = items.find((item) => item.code === 'stone');
  if (!stoneItem) throw new Error('Stone item not found');
  const woodItem = items.find((item) => item.code === 'wood');
  if (!woodItem) throw new Error('Wood item not found');

  const listing100Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: stoneItem.id, amount: 1 }],
    price: 100,
    name: 'Test item',
  });

  const listing33Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: woodItem.id, amount: 1 }],
    price: 33,
    name: 'Test item 2',
  });

  return {
    listing100: listing100Res.data.data,
    listing33: listing33Res.data.data,
  };
}

interface ICreateListingsOpts {
  gameServerId: string;
  amount: number;
  name?: string;
}

async function createListings(
  client: Client,
  { gameServerId, amount, name }: ICreateListingsOpts,
): Promise<ShopListingOutputDTO[]> {
  const items = (await client.item.itemControllerSearch()).data.data;

  const createdItems = await Promise.all(
    Array.from({ length: amount }).map(async () => {
      const item = await client.shopListing.shopListingControllerCreate({
        gameServerId,
        items: [{ itemId: items[0].id, amount: 1 }],
        price: faker.number.int({ min: 1, max: 100 }),
        name: name ?? faker.commerce.productName(),
      });

      return item.data.data;
    }),
  );

  return createdItems;
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

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: setupData.gameserver.id,
    versionId: setupData.economyUtilsModule.latestVersion.id,
  });

  const { listing100, listing33 } = await setupShop(this.client, setupData.gameserver.id);

  const { client: user1Client, user: user1 } = await createUserForPlayer(
    this.client,
    setupData.players[0].id,
    setupData.gameserver.id,
  );

  const { client: user2Client, user: user2 } = await createUserForPlayer(
    this.client,
    setupData.players[1].id,
    setupData.gameserver.id,
  );

  const { client: user3Client, user: user3 } = await createUserForPlayer(
    this.client,
    setupData.players2[0].id,
    setupData.gameserver2.id,
  );

  const { client: user4Client, user: user4 } = await createUserForPlayer(
    this.client,
    setupData.players2[1].id,
    setupData.gameserver2.id,
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[0].id,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[1].id,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver2.id,
    setupData.players2[0].id,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver2.id,
    setupData.players2[1].id,
    { currency: 250 },
  );

  const items = (
    await this.client.item.itemControllerSearch({
      sortBy: 'name',
      filters: { gameserverId: [setupData.gameserver.id] },
    })
  ).data.data;
  const items2 = (
    await this.client.item.itemControllerSearch({
      sortBy: 'name',
      filters: { gameserverId: [setupData.gameserver2.id] },
    })
  ).data.data;

  return {
    ...setupData,
    listing100,
    listing33,
    items,
    items2,
    createListings,
    user1,
    client1: user1Client,
    user2,
    client2: user2Client,
    user3,
    client3: user3Client,
    user4,
    client4: user4Client,
  };
};
