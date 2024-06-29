import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { ItemsOutputDTO, ShopListingOutputDTO, ShopOrderOutputDTOStatusEnum } from '@takaro/apiclient';

const group = 'ShopOrderController';

interface IShopSetup extends SetupGameServerPlayers.ISetupData {
  items: ItemsOutputDTO[];
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
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

  const listing100Res = await this.client.shopListing.shopListingControllerCreate({
    gameServerId: setupData.gameServer1.id,
    itemId: items[0].id,
    price: 100,
    name: 'Test item',
  });

  const listing33Res = await this.client.shopListing.shopListingControllerCreate({
    gameServerId: setupData.gameServer1.id,
    itemId: items[1].id,
    price: 33,
    name: 'Test item 2',
  });

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameServer1.id,
    setupData.players[0].id,
    { currency: 250 }
  );

  return {
    ...setupData,
    items,
    listing100: listing100Res.data.data,
    listing33: listing33Res.data.data,
  };
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create a new order',
    setup: shopSetup,
    test: async function () {
      const res = await this.client.shopOrder.shopOrderControllerCreateOrder({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Paid);

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
