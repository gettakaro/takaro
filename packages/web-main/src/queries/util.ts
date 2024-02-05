import { MetadataOutput } from '@takaro/apiclient';
import { ErrorMessageMapping, getErrorUserMessage } from '@takaro/lib-components/src/errors';
import { UseMutationResult } from '@tanstack/react-query';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    return pageIndex++;
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
