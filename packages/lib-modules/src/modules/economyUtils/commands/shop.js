import { takaro, data } from '@takaro/helpers';

async function main() {
  const { arguments: args, player } = data;

  const { page } = args;

  const shopItems = await takaro.shopListing.shopListingControllerSearch({
    limit: 5,
    page: page - 1,
    sortBy: 'name',
    sortDirection: 'asc',
  });

  if (shopItems.data.data.length === 0) {
    await player.pm('No items found.');
    return;
  }

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', data.gameServerId)).data.data;

  for (const listing of shopItems.data.data) {
    const items = listing.items.slice(0, 3).map((item) => {
      return `${item.amount}x ${item.item.name}`;
    });
    await player.pm(`- ${listing.name} - ${listing.price} ${currencyName.value}. ${items.join(', ')}`);
  }
}

await main();
