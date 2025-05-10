import { Client, ShopListingOutputDTO, UserOutputDTO } from '@takaro/apiclient';
import { IModuleTestsSetupData, modulesTestSetup } from './modulesSetup.js';
import { integrationConfig } from '../test/integrationConfig.js';
import { expect } from '../test/expect.js';
import { EventsAwaiter } from '../test/waitForEvents.js';
import { IntegrationTest } from '../integrationTest.js';
import { faker } from '@faker-js/faker';
import { Redis } from '@takaro/db';

export interface IShopSetup extends IModuleTestsSetupData {
  userClient: Client;
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
  createListings: (client: Client, opts: ICreateListingsOpts) => Promise<ShopListingOutputDTO[]>;
}

async function getSecretCodeForPlayer(playerId: string) {
  const redis = await Redis.getClient('playerLink');
  // We store the code in redis with key as the code and the value is the actual secret code
  // secret-code : playerId
  // So we need to reverse it here and do a very inefficient search
  // Unfortunate, but this is test code so not the end of the world
  const allKeys = await redis.keys('*');
  // Filter out the domain keys, we only want keys that store playerIds
  const playerLinkKeys = allKeys.filter((key) => key.startsWith('playerLink') && !key.includes('-domain'));
  // Search through the keys to find the one where the value matches our playerId
  for (const key of playerLinkKeys) {
    const storedPlayerId = await redis.get(key);
    if (storedPlayerId === playerId) {
      return key.split(':')[1];
    }
  }

  throw new Error(`No secret code found for playerId ${playerId}`);
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
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email, code });

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

  return { ...setupData, userClient, listing100, listing33, createListings };
};
