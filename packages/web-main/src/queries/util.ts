import { MetadataOutput } from '@takaro/apiclient';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    console.log('this is triggered');
    return [pageIndex++];
  }

  console.log('undefined triggered');
  return [undefined];
}
