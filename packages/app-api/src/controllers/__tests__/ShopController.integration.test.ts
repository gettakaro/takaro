import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { ItemsOutputDTO, ShopListingOutputDTO } from '@takaro/apiclient';

const group = 'ShopController';

interface IShopSetup extends SetupGameServerPlayers.ISetupData {
  items: ItemsOutputDTO[];
  listing: ShopListingOutputDTO;
}

const shopSetup = async function (this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await SetupGameServerPlayers.setup.bind(
    this as unknown as IntegrationTest<SetupGameServerPlayers.ISetupData>
  )();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameServer1.id,
  });

  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameServer1.id,
    value: 'test coin',
  });

  const items = (await this.client.item.itemControllerSearch()).data.data;

  const listingRes = await this.client.shop.shopControllerCreate({
    gameServerId: setupData.gameServer1.id,
    itemId: items[0].id,
    price: 100,
    name: 'Test item',
  });

  return {
    ...setupData,
    items,
    listing: listingRes.data.data,
  };
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: shopSetup,
    filteredFields: ['itemId', 'functionId', 'gameServerId'],
    test: async function () {
      return this.client.shop.shopControllerGetOne(this.setupData.listing.id);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create',
    setup: shopSetup,
    filteredFields: ['itemId', 'functionId', 'gameServerId'],
    test: async function () {
      const items = (await this.client.item.itemControllerSearch()).data.data;
      const res = await this.client.shop.shopControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        itemId: items[0].id,
        price: 150,
        name: 'Test item',
      });

      const findRes = await this.client.shop.shopControllerGetOne(res.data.data.id);
      expect(findRes.data.data.price).to.be.equal(150);

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Update',
    setup: shopSetup,
    filteredFields: ['itemId', 'functionId', 'gameServerId'],
    test: async function () {
      const res = await this.client.shop.shopControllerUpdate(this.setupData.listing.id, {
        price: 200,
        itemId: this.setupData.items[1].id,
        gameServerId: this.setupData.gameServer1.id,
        name: 'Updated item',
      });

      const findRes = await this.client.shop.shopControllerGetOne(res.data.data.id);
      expect(findRes.data.data.price).to.be.equal(200);
      expect(findRes.data.data.itemId).to.be.equal(this.setupData.items[1].id);
      expect(findRes.data.data.name).to.be.equal('Updated item');

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: shopSetup,
    expectedStatus: 404,
    test: async function () {
      await this.client.shop.shopControllerDelete(this.setupData.listing.id);
      return this.client.shop.shopControllerGetOne(this.setupData.listing.id);
    },
  }),
  // Creating a listing with no item or function should fail
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create without item or function',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shop.shopControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        price: 150,
        name: 'Test item',
      });
    },
  }),
  // Price cannot be negative
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create with negative price',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shop.shopControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        itemId: this.setupData.items[0].id,
        price: -100,
        name: 'Test item',
      });
    },
  }),
  // Price cannot be zero
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create with zero price',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shop.shopControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        itemId: this.setupData.items[0].id,
        price: 0,
        name: 'Test item',
      });
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
