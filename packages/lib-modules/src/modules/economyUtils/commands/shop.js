import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { arguments: args, player, gameServerId } = data;

  const { page, item, action } = args;

  const shopItems = await takaro.shopListing.shopListingControllerSearch({
    limit: 5,
    page: page - 1,
    sortBy: 'name',
    sortDirection: 'asc',
    filters: {
      gameServerId: [gameServerId],
      draft: false,
    },
  });

  if (shopItems.data.data.length === 0) {
    await player.pm('No items found.');
    return;
  }

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', data.gameServerId)).data.data;

  if (!item) {
    // List the shop items
    for (const listing of shopItems.data.data) {
      const items = listing.items.slice(0, 3).map((item) => {
        return `${item.amount}x ${item.item.name}`;
      });
      await player.pm(`- ${listing.name} - ${listing.price} ${currencyName.value}. ${items.join(', ')}`);
    }
    return;
  }

  const selectedItem = shopItems.data.data[item - 1];
  if (!selectedItem)
    throw new TakaroUserError(
      `Item not found. Please select an item from the list, valid options are 1-${shopItems.data.data.length}.`,
    );

  if (action === 'none') {
    // Display more info about the item
    await player.pm(`Listing ${selectedItem.name} - ${selectedItem.price} ${currencyName.value}`);
    await Promise.all(
      selectedItem.items.map((item) => {
        const quality = item.quality ? `Quality: ${item.quality}` : '';
        const description = (item.item.description ? `Description: ${item.item.description}` : '').replaceAll(
          '\\n',
          ' ',
        );

        return player.pm(`- ${item.amount}x ${item.item.name}. ${quality} ${description}`);
      }),
    );
    return;
  }

  if (action === 'buy') {
    await takaro.shopOrder.shopOrderControllerCreate({
      amount: 1,
      listingId: selectedItem.id,
      userId: data.user.id,
    });
    await player.pm(
      `You have purchased ${selectedItem.name} for ${selectedItem.price} ${currencyName.value}. You can now claim your items.`,
    );
    return;
  }

  throw new TakaroUserError('Invalid action. Valid actions are "buy".');
}

await main();
