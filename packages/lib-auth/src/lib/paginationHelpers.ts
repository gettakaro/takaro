import { IdentityApi } from '@ory/client';
import { parse, URLSearchParams } from 'url';

export async function* paginateIdentities(adminClient: IdentityApi, page = undefined, perPage = 100) {
  let nextPage: number | undefined = page;

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

    if (!nextLink) {
      break;
    }

    // Extract the 'next' page URL
    const match = nextLink.match(/<(.*)>/);
    const url = match ? match[1] : undefined;

    if (!url) {
      break;
    }

    const parsedUrl = parse(url);
    const params = new URLSearchParams(parsedUrl.query || '');
    const nextPageToken = params.get('page');
    if (nextPageToken) {
      nextPage = parseInt(nextPageToken, 10);
    } else {
      break; // stop if there is no next page
    }
  }
}
