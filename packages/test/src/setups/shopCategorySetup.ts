import { Client, ShopCategoryOutputDTO, ShopListingOutputDTO, ItemsOutputDTO } from '@takaro/apiclient';
import { IShopSetup, shopSetup } from './shopSetup.js';
import { IntegrationTest } from '../integrationTest.js';
import { faker } from '@faker-js/faker';

export interface IShopCategorySetup extends IShopSetup {
  rootCategories: {
    weapons: ShopCategoryOutputDTO;
    armor: ShopCategoryOutputDTO;
    tools: ShopCategoryOutputDTO;
  };
  childCategories: {
    melee: ShopCategoryOutputDTO;
    ranged: ShopCategoryOutputDTO;
    helmet: ShopCategoryOutputDTO;
    chest: ShopCategoryOutputDTO;
    hand: ShopCategoryOutputDTO;
    power: ShopCategoryOutputDTO;
  };
  categorizedListings: ShopListingOutputDTO[];
  uncategorizedListings: ShopListingOutputDTO[];
}

async function createCategoryHierarchy(client: Client): Promise<{
  rootCategories: IShopCategorySetup['rootCategories'];
  childCategories: IShopCategorySetup['childCategories'];
}> {
  // Fetch existing default categories that were created during domain initialization
  const allCategoriesRes = await client.shopCategory.shopCategoryControllerGetAll();
  const allCategories = allCategoriesRes.data.data;

  // Find the default categories by name
  const weapons = allCategories.find((cat) => cat.name === 'Weapons' && !cat.parentId);
  const armor = allCategories.find((cat) => cat.name === 'Armor' && !cat.parentId);
  const tools = allCategories.find((cat) => cat.name === 'Tools' && !cat.parentId);

  if (!weapons || !armor || !tools) {
    throw new Error('Default categories not found. Expected Weapons, Armor, and Tools categories to exist.');
  }

  // Create child categories under Weapons
  const meleeRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Melee Weapons',
    emoji: '⚔️',
    parentId: weapons.id,
  });
  const melee = meleeRes.data.data;

  const rangedRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Ranged Weapons',
    emoji: '🏹',
    parentId: weapons.id,
  });
  const ranged = rangedRes.data.data;

  // Create child categories under Armor
  const helmetRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Helmets',
    emoji: '⛑️',
    parentId: armor.id,
  });
  const helmet = helmetRes.data.data;

  const chestRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Chest Armor',
    emoji: '🦺',
    parentId: armor.id,
  });
  const chest = chestRes.data.data;

  // Create child categories under Tools
  const handRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Hand Tools',
    emoji: '🔨',
    parentId: tools.id,
  });
  const hand = handRes.data.data;

  const powerRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Power Tools',
    emoji: '⚡',
    parentId: tools.id,
  });
  const power = powerRes.data.data;

  return {
    rootCategories: {
      weapons,
      armor,
      tools,
    },
    childCategories: {
      melee,
      ranged,
      helmet,
      chest,
      hand,
      power,
    },
  };
}

async function createCategorizedListings(
  client: Client,
  gameServerId: string,
  items: ItemsOutputDTO[],
  categories: {
    rootCategories: IShopCategorySetup['rootCategories'];
    childCategories: IShopCategorySetup['childCategories'];
  },
): Promise<{
  categorizedListings: ShopListingOutputDTO[];
  uncategorizedListings: ShopListingOutputDTO[];
}> {
  if (items.length < 3) {
    throw new Error('Not enough items available for creating shop listings');
  }

  // Create categorized listings
  const meleeListingRes = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[0].id, amount: 1 }],
    price: faker.number.int({ min: 10, max: 50 }),
    name: 'Iron Sword',
    categoryIds: [categories.childCategories.melee.id],
  });

  const rangedListingRes = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[1].id, amount: 1 }],
    price: faker.number.int({ min: 15, max: 60 }),
    name: 'Wooden Bow',
    categoryIds: [categories.childCategories.ranged.id],
  });

  const helmetListingRes = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[2].id, amount: 1 }],
    price: faker.number.int({ min: 20, max: 40 }),
    name: 'Iron Helmet',
    categoryIds: [categories.childCategories.helmet.id],
  });

  // Create listing with multiple categories
  const multiCategoryListingRes = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[0].id, amount: 1 }],
    price: faker.number.int({ min: 25, max: 75 }),
    name: 'Combat Gear Bundle',
    categoryIds: [categories.childCategories.melee.id, categories.childCategories.helmet.id],
  });

  // Create uncategorized listings
  const uncategorized1Res = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[1].id, amount: 1 }],
    price: faker.number.int({ min: 5, max: 25 }),
    name: 'Misc Item 1',
  });

  const uncategorized2Res = await client.shopListing.shopListingControllerCreate({
    gameServerId,
    items: [{ itemId: items[2].id, amount: 1 }],
    price: faker.number.int({ min: 8, max: 30 }),
    name: 'Misc Item 2',
  });

  return {
    categorizedListings: [
      meleeListingRes.data.data,
      rangedListingRes.data.data,
      helmetListingRes.data.data,
      multiCategoryListingRes.data.data,
    ],
    uncategorizedListings: [uncategorized1Res.data.data, uncategorized2Res.data.data],
  };
}

export const shopCategorySetup = async function (
  this: IntegrationTest<IShopCategorySetup>,
): Promise<IShopCategorySetup> {
  const shopSetupData = await shopSetup.bind(this as unknown as IntegrationTest<IShopSetup>)();

  // Create category hierarchy
  const { rootCategories, childCategories } = await createCategoryHierarchy(this.client);

  // Create listings with categories
  const { categorizedListings, uncategorizedListings } = await createCategorizedListings(
    this.client,
    shopSetupData.gameserver.id,
    shopSetupData.items,
    { rootCategories, childCategories },
  );

  return {
    ...shopSetupData,
    rootCategories,
    childCategories,
    categorizedListings,
    uncategorizedListings,
  };
};
