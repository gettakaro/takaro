import { DrawerSkeleton } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { variableQueryOptions } from '../../../queries/variable';
import { VariablesForm } from './-variables/VariablesForm';
import { queryClient } from '../../../queryClient';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { useQuery } from '@tanstack/react-query';

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
  const loaderData = Route.useLoaderData();
  const { variableId } = Route.useParams();
  const { data } = useQuery({ ...variableQueryOptions(variableId), initialData: loaderData });

  return <VariablesForm isLoading={false} variable={data} />;
}
