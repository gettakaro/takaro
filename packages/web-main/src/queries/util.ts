import { MetadataOutput } from '@takaro/apiclient';
import { ErrorMessageMapping, getErrorUserMessage } from '@takaro/lib-components/src/errors';
import { UseMutationResult } from '@tanstack/react-query';

export function hasNextPage(pageInfo: MetadataOutput) {
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }
  if (pageInfo.page! < Math.floor(pageInfo.total! / pageInfo.limit!)) {
    return pageInfo.page! + 1;
  }
  return undefined;
}

export function mutationWrapper<I, O>(
  mutation: any,
  errorMessages: Partial<ErrorMessageMapping>
): UseMutationResult<I, string | string[], O, unknown> {
  mutation.error = getErrorUserMessage(mutation.error, errorMessages);
  return mutation;
}

// Usecase: gets rid of empty objects in the queryKeys
// spreading an empty object returns an empty object
// Spreading an empty array returns nothing
export function queryParamsToArray(queryParams: any) {
  return Object.keys(queryParams).length > 0 ? [{ ...queryParams }] : [];
}
