import { IdentityApi } from '@ory/client';

export async function* paginateIdentities(adminClient: IdentityApi, page = undefined, perPage = 1) {
  let nextPage = page;

  while (true) {
    const response = await adminClient.listIdentities({
      page: nextPage,
      perPage,
    });

    if (response.data.length === 0) {
      // Stop the iteration if there are no more items
      break;
    }

    yield response.data;

    // Parse Link header
    const linkHeader = response.headers.link;
    const links = linkHeader.split(',');

    const nextLink = links.find((link: string) => link.includes('rel="next"'));

    if (nextLink) {
      // Extract the 'next' page URL
      const match = nextLink.match(/<(.*)>/);
      nextPage = match ? match[1] : undefined;
    } else {
      break; // stop if there is no next page
    }
  }
}
