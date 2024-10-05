import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { variableQueryOptions } from 'queries/variable';
import { VariablesForm } from './-variables/VariablesForm';
import { queryClient } from 'queryClient';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/variables/view/$variableId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params }) => queryClient.ensureQueryData(variableQueryOptions(params.variableId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const data = Route.useLoaderData();
  return <VariablesForm isLoading={false} variable={data} />;
}
