import { IdentityApi } from '@ory/client';

export async function* paginateIdentities(adminClient: IdentityApi, page = 1, perPage = 100) {
  let currentPage = page;

  while (true) {
    const response = await adminClient.listIdentities({
      page: currentPage,
      perPage,
    });

    if (response.data.length === 0) {
      // Stop the iteration if there are no more items
      break;
    }

    yield response.data;

    currentPage++;
  }
}
