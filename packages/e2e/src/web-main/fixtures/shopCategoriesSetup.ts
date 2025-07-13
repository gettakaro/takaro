import { Client, ShopCategoryOutputDTO } from '@takaro/apiclient';

export interface ShopCategoriesSetupData {
  categories: {
    weapons: ShopCategoryOutputDTO;
    melee: ShopCategoryOutputDTO;
    ranged: ShopCategoryOutputDTO;
  };
}

export async function setupShopCategories(client: Client): Promise<ShopCategoriesSetupData> {
  // Get existing default categories
  const allCategoriesRes = await client.shopCategory.shopCategoryControllerGetAll();
  const allCategories = allCategoriesRes.data.data;

  // Find the Weapons category
  const weapons = allCategories.find((cat) => cat.name === 'Weapons' && !cat.parentId);

  if (!weapons) {
    throw new Error('Default Weapons category not found');
  }

  // Create subcategories under Weapons
  const meleeRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Melee',
    emoji: '⚔️',
    parentId: weapons.id,
  });
  const melee = meleeRes.data.data;

  const rangedRes = await client.shopCategory.shopCategoryControllerCreate({
    name: 'Ranged',
    emoji: '🏹',
    parentId: weapons.id,
  });
  const ranged = rangedRes.data.data;

  return {
    categories: {
      weapons,
      melee,
      ranged,
    },
  };
}
